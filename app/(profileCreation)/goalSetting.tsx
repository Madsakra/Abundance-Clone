import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import LoadingAnimation from '~/components/LoadingAnimation';
import PressableTab from '~/components/PressableTab';

type Goal = {
  id: string;
  name: string;
  value: number;
};

export default function GoalSetting() {
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [profileGoals, setProfileGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;
  const uid = user ? user.uid : null;

  // CALL DB
  const loadAllGoals = async () => {
    try {
      const querySnapshot = await firestore().collection('goals').get();

      const temp: Goal[] = querySnapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        name: documentSnapshot.data().name,
        value: documentSnapshot.data().value,
      }));
      setAllGoals(temp);
    } catch (error) {
      console.error('Error loading health conditions: ', error);
    }
  };

  const handleGoals = (newGoal: Goal) => {
    // set health condi if selected, unselect if tapped again
    // also make sure no double entries
    setProfileGoals((prevState) => {
      // Check if the condition is already selected
      const exists = prevState.some((oldGoal) => oldGoal.id === newGoal.id);

      if (exists) {
        // If it exists, remove it (deselect)
        return prevState.filter((oldGoal) => oldGoal.id !== newGoal.id);
      } else {
        // If it doesn't exist, add it (select)
        return [...prevState, newGoal];
      }
    });
  };

  const pushDataToFirebase = async () => {
    const profileData = await loadProfileData();
    console.log(profileData);
    console.log(profileGoals);
    console.log(uid);

    console.log(profileData.image);
    const reference = storage().ref(`${uid}-profile-picture`);
    const pathToFile = profileData.image;
    // uploads file
    await reference.putFile(pathToFile);
    // GET URL
    const url = await reference.getDownloadURL();
    console.log(url);

    const finalProfile = {
      image: url,
      birthDate: profileData.birthDate,
      gender: profileData.gender,
      height: JSON.parse(profileData.height),
      weight: JSON.parse(profileData.weight),
      profileDiet: profileData.profileDiet,
      profileHealthCondi: profileData.profileHealthCondi,
      goals: profileGoals,
    };

    if (uid) {
      await firestore()
        .collection('profiles')
        .doc(uid) // Use the current UID as the document ID
        .set(finalProfile);
      console.log('Profile created successfully!');
    }
  };

  // load pre-existing data , so user don't have to restart
  const loadProfileData = async () => {
    const data = await AsyncStorage.getItem('profileData');
    if (data) {
      return JSON.parse(data);
    }
  };

  const nextSection = async () => {
    try {
      if (profileGoals.length === 0) {
        alert('You have yet to select at least 1 goal');
      } else if (profileGoals.length > 3) {
        alert('You can only select up to 3 goals!');
      } else {
        // CALL API TO SEND ALL DATA TO STORAGE
        setLoading(true);

        await pushDataToFirebase();

        // ONCE DONE REMOVE ALL DATA FROM INTERNAL STORAGE AND ROUTE THEM TO PROFILE CREATED
        await AsyncStorage.removeItem('profileData');
        console.log('Profile data removed in local');
        setTimeout(() => {
          setLoading(false);
          router.replace('/(profileCreation)/profileCreated');
        }, 2000);
      }
    } catch (err) {
      console.log('Error creating profile', err);
    }
  };

  useEffect(() => {
    loadAllGoals();
    loadProfileData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Link href="/(profileCreation)/dietInfo" style={{ padding: 25 }}>
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </Link>

      <Text style={styles.header}>Goal Setting</Text>
      <Text style={styles.subHeader}>
        Final step ! You can select up to 3 goals and you can change them later.
      </Text>

      <Image
        source={require('assets/profileCreation/goal.jpg')}
        style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 20 }}
      />

      <View style={styles.listBox}>
        <FlashList
          data={allGoals}
          extraData={profileGoals}
          renderItem={({ item }) => (
            <PressableTab
              editable
              isPressed={profileGoals.some(
                (condition) => condition.id === item.id // Ensure you're comparing by id
              )}
              tabBoxStyle={styles.tabBox}
              handleInfo={handleGoals}
              tabTextStyle={styles.tabTextStyle}
              tabValue={item}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <FunctionTiedButton
        buttonStyle={styles.buttonBox}
        onPress={nextSection}
        textStyle={styles.buttonText}
        title="Next"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    textAlign: 'center',
  },

  subHeader: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#818181',
    paddingVertical: 10,
    paddingHorizontal: 40,
  },

  listHeader: {
    paddingLeft: 25,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },

  tabBox: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
  },

  tabTextStyle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
    width: 200,
  },

  listContainer: {
    padding: 20,
  },

  buttonBox: {
    backgroundColor: '#6B7FD6',
    borderRadius: 30,
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },

  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    padding: 12,
    textAlign: 'center',
  },

  listBox: {
    height: 250,
    borderWidth: 1,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#D2D2D2',
  },
});
