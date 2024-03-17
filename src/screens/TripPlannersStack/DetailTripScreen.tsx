/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React,{ FC, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  // Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import {convertDatetoString2} from '../../Helper/convertDate';
import {JSX} from 'react/jsx-runtime';

export const DetailTripScreen: FC = (): JSX.Element => {
  const navigation = useNavigation<any>();
  const [token, setToken] = useState<string>();
  const [result, setResult] = useState<any>(null);
  const [selectDay, setselectDay] = useState<string[]>([]);
  const route = useRoute();
  const {idTrip}: any = route.params;

  useEffect(() => {
    AsyncStorage.getItem('AccessToken').then((tokenSave: any) =>
      setToken(tokenSave),
    );
  }, [token]);

  useEffect(() => {
    if (token !== undefined) {
      console.log('ab', token);
      const senRequest = async () => {
        try {
          const APIurl = `http://52.63.147.17:8080/trip-plan/get-trip/${idTrip}`;
          const res = await axios.get(APIurl, {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          });
          setResult(res.data.tripDatas);
          console.log(res.data.tripDatas);
        } catch {
          (e: any) => console.log(e);
        }
      };
      senRequest();
    }
  }, [token]);

  const handleSelectChange = (item: string) => {
    const isselectDay = selectDay.includes(item);
    if (isselectDay) {
      setselectDay((prevselectDay: any[]) =>
        prevselectDay.filter((selectDayItem: string) => selectDayItem !== item),
      );
    } else {
      setselectDay((prevselectDay: any) => [...prevselectDay, item]);
    }
  };

  const renderActivity = ({item: activity}: any) => (
    <View style={{flexDirection: 'row', marginVertical: 5, marginLeft: 5}}>
      <View style={{flex: 2}}>
        <Text style={styles.text}>{`${activity.challengeSummary}`}</Text>
        <ScrollView
          style={{marginLeft: 10}}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <Animatable.Text
            animation={{
              from: {translateX: 200},
              to: {translateX: -500},
            }}
            duration={8000}
            iterationCount="infinite"
            easing="linear"
            style={{
              ...styles.text,
              fontWeight: '200',
            }}>
            {activity.location}
          </Animatable.Text>
        </ScrollView>
        <Text
          style={{
            ...styles.text,
            fontWeight: '200',
            alignSelf: 'flex-end',
          }}>
          Điểm nhận được: {activity.points}
        </Text>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity>
          <Text
            style={{...styles.text, ...styles.btn}}
            onPress={() => navigation.navigate('CameraScreen')}>
            Thêm ảnh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderDay = ({item: day}: any, index: number) => (
    <View style={styles.dayView}>
      <TouchableOpacity
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
        onPress={() => {
          handleSelectChange(index.toString());
        }}>
        <View style={{maxWidth: '70%'}}>
          <Text
            style={{
              ...styles.text,
              ...styles.sdHeading,
              fontSize: 16,
            }}>
            {day.title}
          </Text>
        </View>
        <View
          style={{
            width: '30%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              ...styles.text,
            }}>
            {convertDatetoString2(day.date)}
          </Text>
          <Ionicons
            name={
              selectDay.includes(index.toString()) ? 'caret-up' : 'caret-down'
            }
            size={20}
            color={'#aaa'}
          />
        </View>
      </TouchableOpacity>

      {selectDay.includes(index.toString()) && (
        <FlatList
          data={day.challenges}
          keyExtractor={(item, index) => item + index.toString()}
          renderItem={renderActivity}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ImageBackground
            style={{
              width: '100%',
              height: 200,
              marginVertical: 15,
              justifyContent: 'flex-end',
            }}
            resizeMode="cover"
            source={require('../../Images/location.png')}>
            <TouchableOpacity style={{...styles.btn, flexDirection: 'row'}}>
              <Text>Xem bản đồ</Text>
              <Ionicons name="map" size={20} color="#fff" />
            </TouchableOpacity>
            <LinearGradient
              colors={['#00000000', '#000000']}
              style={{
                height: '50%',
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}>
              <Text style={styles.heading}>{result?.location}</Text>
              <Text style={{...styles.heading, fontWeight: '200'}}>
                {result &&
                  `${convertDatetoString2(
                    result?.startDate,
                  )} - ${convertDatetoString2(result?.endDate)}`}
              </Text>
            </LinearGradient>
          </ImageBackground>
        }
        style={{margin: 0, paddingHorizontal: 15, gap: 5}}
        data={result?.dataTripDays}
        keyExtractor={(item: any, index: {toString: () => any}) =>
          item + index.toString()
        }
        renderItem={(item: {index: number}) => renderDay(item, item.index + 1)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1},
  heading: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
  sdHeading: {fontWeight: '600'},
  dayView: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 5,
    shadowOpacity: 3,
    shadowColor: 'gray',
  },
  text: {
    color: '#000',
  },
  sendBtn: {
    backgroundColor: '#2AB6AD',
    padding: 10,
    borderRadius: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  nameForTripForm: {
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderColor: '#2AB6AD',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    opacity: 1,
    left: Dimensions.get('window').width / 2 - 145,
    top: Dimensions.get('window').height / 2 - 100,
  },
  input: {
    height: 40,
    width: 250,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    marginBottom: 5,
    paddingLeft: 15,
    alignSelf: 'center',
    color: '#000',
  },
  btn: {
    backgroundColor: '#2AB6AD',
    padding: 10,
    borderRadius: 10,
  },
  retryBtn: {
    color: '#2AB6AD',
    fontSize: 30,
    fontWeight: '900',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2AB6AD',
    marginTop: 10,
  },
});