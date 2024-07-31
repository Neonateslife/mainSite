import HeadWithBack from "../microcomponents/HeadWithBack";
import { Input, File, TextArea } from "../microcomponents/textComponents";
import { ProfileImage } from "../microcomponents/textComponents";
import { Button3, LogOutButton, } from "../microcomponents/RoundedButton";
import RoundedButton from "../microcomponents/RoundedButton";
import { useEffect, useState } from "react";
import DatesAval from "../microcomponents/DateSelector";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { setUserId } from "firebase/analytics";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { clearUser } from "../../redux/authSlice";

const DoctorAvailabilityForm = ({ availability, setAvailability, daysChecked, setDaysChecked }) => {
  const handleAddHour = (day, hour) => {
    const newHour = hour.trim();
    if (newHour && !availability[day].includes(newHour)) {
      setAvailability({
        ...availability,
        [day]: [...availability[day], newHour]
      });
    }
  };

  const handleCheck = (day) => {
    setDaysChecked({ ...daysChecked, [day]: !daysChecked[day] });
  };

  const handleRemoveHour = (day, hour) => {
    setAvailability({
      ...availability,
      [day]: availability[day].filter(h => h !== hour)
    });
  };

  return (
    <div className="p-4">
      {Object.keys(availability).map((day) => (
        <div key={day} className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => handleCheck(day)}
              checked={daysChecked[day]}
            />
            {day}
          </label>
          {daysChecked[day] && (
            <div className="mt-2  ">
            <div className="div flex gap-[20px]">
            <input
                type="text"
                className="border p-1 rounded"
                placeholder="Add available hour"
                onBlur={(e) => handleAddHour(day, e.target.value)}
              />
              <div
                className="ml-2 bg-blue text-white px-2 py-1 rounded cursor-pointer"
                onClick={(e) => handleAddHour(day, e.target.previousSibling.value)}
              >
                Add Hour
              </div>
            </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availability[day].map((hour) => (
                  <div
                    key={hour}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded mt-1 w-[max-content] gap-2"
                  >
                    <span>{hour}</span>
                    <button
                      className="text-red-500 text-[25px]"
                      onClick={() => handleRemoveHour(day, hour)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
const Doctor = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });

  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [daysChecked, setDaysChecked] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorQuery = query(collection(db, "doctors"), where("uid", "==", user));
        const querySnapshot = await getDocs(doctorQuery);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setFormData({
            firstName: docData.firstName,
            lastName: docData.lastName,
            bio: docData.bio,
          });
          setAvailability(docData.availability || {});
          const checkedDays = {};
          for (const day in docData.availability) {
            checkedDays[day] = docData.availability[day].length > 0;
          }
          setDaysChecked(checkedDays);
        }
      } catch (error) {
        console.error("Error fetching doctor data: ", error);
      }
    };

    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const doctorQuery = query(collection(db, "doctors"), where("uid", "==", user));
      const querySnapshot = await getDocs(doctorQuery);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const userDoc = doc(db, "doctors", docId);
        const existingDoc = querySnapshot.docs[0].data();

        const updatedAvailability = {
          ...existingDoc.availability,
          ...availability,
        };

        await updateDoc(userDoc, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          availability: updatedAvailability,
        });

        if (profileImage) {
          // Add your image upload logic here if required
        }

        alert('Profile updated successfully');
      } else {
        console.error("No matching documents.");
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  const handleLogOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate('/');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <div className="overflow-y-auto pb-[120px]">
      <div className="w-[50px] h-[50px] relative m-auto mt-[50px] md:w-[100px] md:h-[100px]">
        <div className="absolute bottom-0 right-[10px] bg-white p-2 rounded-full w-[max-content]">
          <ProfileImage />
        </div>
        <img
          src={profileImage ? URL.createObjectURL(profileImage) : "https://picsum.photos/200/300"}
          alt=""
          className="w-full h-full rounded-full"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <Input label="Edit First name" name="firstName" placeholder="Enter name" value={formData.firstName} onChange={handleChange} />
        <Input label="Edit Last name" name="lastName" placeholder="Enter name" value={formData.lastName} onChange={handleChange} />
        <div className="div w-[300px] m-auto pt-[20px] md:w-[450px]">
          <DoctorAvailabilityForm
            availability={availability}
            setAvailability={setAvailability}
            daysChecked={daysChecked}
            setDaysChecked={setDaysChecked}
          />
        </div>
        <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <Button3
            bg="bg-bluebutton"
            color="text-black"
            rounded="rounded-[10px]"
            text="Edit password"
          />
        </div>
        <File label="Edit Profile Picture" type="file" onChange={handleImageChange} />
        <div className="w-[340px] m-auto pt-[20px] md:w-[500px]">
          <TextArea label="Edit Bio" name="bio" placeholder="Enter bio" value={formData.bio} onChange={handleChange} />
        </div>
        <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <RoundedButton text="Save" type="submit" onClick={handleSubmit} />
        </div>
        <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <RoundedButton text="Signout" type="button" bg='red' onClick={handleLogOut} />
        </div>
      </form>
    </div>
  );
};



const Mother = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
const dispatch = useDispatch()
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const motherQuery = query(collection(db, "mothers"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(motherQuery);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const userDoc = doc(db, "mothers", docId);
        await updateDoc(userDoc, {
          firstName: formData.firstName,
          lastName: formData.lastName
        });

        alert('Updated your profile');
      } else {
        console.error("No matching documents.");
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  const handleEditPasswordClick = (event) => {
    event.preventDefault();
    navigate("/profile/EditPassword");
  };
  const handleLogOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      // Redirect the user to the login page or home page
      dispatch(clearUser());
      navigate('/');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };
  
  return (
    <>
      <div className="img overflow-y-auto w-[50px] h-[50px] relative m-auto mt-[50px] md:w-[100px] md:h-[100px]">
        <div className="div absolute bottom-0 right-[10px] bg-white p-2 rounded-full w-[max-content]">
          <ProfileImage />
        </div>
        <img src="https://picsum.photos/200/300" alt="" className="w-full h-full rounded-full" />
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          label="Edit First name"
          placeholder="Enter name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
        <Input
          label="Edit Last name"
          placeholder="Enter name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />

        <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <Button3
            bg="bg-bluebutton"
            color="text-black"
            rounded="rounded-[10px]"
            text="Edit password"
            onClick={handleEditPasswordClick}
          />
        </div>
        <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <RoundedButton
            text="Save"
            type="submit"
          />
        </div>
      </form>

      <div className="w-[300px] m-auto pt-[20px] md:w-[450px]">
          <RoundedButton text="Signout" type="button" bg='red'  onClick={handleLogOut} />
        </div>
    </>
  );
};

export default function DoctorProfile() {
  const user = useSelector(state => state.auth.user);
  const [userType, setUserType] = useState(null);

  const navigate = useNavigate()
  useEffect(() => {


    // Function to determine user type
    const determineUserType = async () => {
      if (user) {
        try {
          console.log("User ID: ", user);
          const uid = user;

          // Check if the user is a doctor
          const doctorQuery = query(collection(db, 'doctors'), where('uid', '==', uid));
          const doctorSnapshot = await getDocs(doctorQuery);

          if (!doctorSnapshot.empty) {
            setUserType('doctor');
            console.log("User is a doctor");
            return;
          }

          // Check if the user is a mother
          const motherQuery = query(collection(db, 'mothers'), where('uid', '==', uid));
          const motherSnapshot = await getDocs(motherQuery);

          if (!motherSnapshot.empty) {
            setUserType('mother');
            console.log("User is a mother");
          }
        } catch (error) {
          console.error("Error determining user type: ", error);
        }
      } else {
        navigate('/User/')
        console.log("No user found");
      }
    };

    determineUserType();


  }, [user]);
  return (
    <div className="w-full h-full overflow-y-auto">
      <HeadWithBack heading=" Profile" />
      {userType === 'doctor' ? <Doctor /> : <Mother />}

    </div>
  );
}

