import React, { useState, useEffect } from "react";
import HeadWithBack from "../microcomponents/HeadWithBack";
import { File, TextArea,Select } from "../microcomponents/textComponents";
import { Button3 } from "../microcomponents/RoundedButton";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBookingDetails } from "../../redux/userSlice";
import { Success,Danger } from "../microcomponents/Toast";
export default function Booking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDay, setSelectedDay] = useState(''); //sets seleted day
  const[selectedDate,setSelectedDate]=useState('')//seting selected date
  const [selectedTime, setSelectedTime] = useState('');//setting selected time
  const [selectedMode, setSelectedMode] = useState('');//setting the available 
  const [file, setFile] = useState(null);//setting the file string 
  const [description, setDescription] = useState('');//setting the description
  const [availability, setAvailability] = useState({});//setting avalible day in the week
  const [days, setDays] = useState([]);//setting the available days i the week
  const [availableDaysInMonth,setAvailableDaysInMonth ]= useState([]);//seting available days of selected day in a month
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();//the state 
  const modes = [ 'select mode','Physical', 'Online'];
  const [doctorUid, setDoctorUid] = useState("")
 const [error,setError]=useState(false)
 const [sucess,setSuccess]=useState(false)
  const selectedDoctor = useSelector(state => state.user.selectedDoctor);
  
  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      try {
        const doctorDoc = doc(db, "doctors", id);
    
        const doctorSnapshot = await getDoc(doctorDoc);
        
        if (doctorSnapshot.exists()) {
          const doctorData = doctorSnapshot.data();
          console.log('the doctor info is',doctorData)
          setDoctorUid(doctorData.uid)
          setAvailability(doctorData.availability || {});
          setDays(Object.keys(doctorData.availability || {}).filter(day => doctorData.availability[day].length > 0));
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    fetchDoctorAvailability();

  }, [id]);
  //getting all availble days in a range of 30 froms day(all tuesdays from current day to the nearest Tuesday in 30 dys)
  const getAvailableDays = (selectedDay) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
    const selectedDate = new Date();
    selectedDate.setDate(currentDate.getDate() + (selectedDayIndex - currentDate.getDay() + 7) % 7);

    let updatedAvailableDays = [];

    for (let i = 0; i < 30; i++) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + i * 7);
        const difference = nextDay - currentDate;
        if (difference >= 0 && difference <= 30 * 24 * 60 * 60 * 1000) {
            updatedAvailableDays.push(nextDay.toDateString());
        }
    }

    setAvailableDaysInMonth(updatedAvailableDays);
    return updatedAvailableDays;
}
//save the data to firebase 
const handleBooking = async (event) => {
  event.preventDefault();
  if (selectedDay && selectedMode) {
    try {
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: user,
        doctorId: doctorUid,
        day: selectedDay,
        time: selectedTime,
        mode: selectedMode,
        file: file ? file.name : '',
        description: description,
        date: selectedDate,
        name: `${selectedDoctor.firstName} ${selectedDoctor.secondName}`,
      });

      const bookingId = bookingRef.id;

      dispatch(setBookingDetails({ day: selectedDay, time: selectedTime, mode: selectedMode, date: selectedDate, bookingId }));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(`/appointment/doctor/${id}/checkout?bookingId=${bookingId}`);
      }, 5000);
     
    } catch (error) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 5000);
      console.error("Error adding booking: ", error);
    }
  }
};



  return (
    <>
      <HeadWithBack heading="Booking Appointment" />
      <div className="toast">
      {
        <div className="toast">
          {
            error&& (<Danger text="Booking failed!" />)
          }
          {
            sucess&& (<Success text="Booking successful!" />)
          }
        </div>
      }
      </div>
      <div className="div w-[90%] m-auto pt-10">
        <div className="div relative -z-50 w-[70px] h-[70px] rounded-[50%] m-auto md:w-[150px] md:h-[150px]">
          <img src="https://picsum.photos/200/300" className="w-full h-full rounded-[50%] border-" alt="loading" loading='lazy' />
          <span className="w-[max-content] h-[max-content] absolute top-[0px] right-[10px]">
          </span>
        </div>
        <form onSubmit={handleBooking} className="w-full ">
          <div className="div  flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[450px]">
          <label  className="text-[15px] text-greytextdark text-left mb-3">
        Select day
         </label>
          <div className="div p-3 shadow-md rounded-[10px]">
            <select
              value={selectedDay}
              onChange={(e) =>{
                 setSelectedDay(e.target.value)
                 setAvailableDaysInMonth([]);
                 getAvailableDays(e.target.value)
                }}
              className="rounded-[10px] outline-none w-full bg-white text-center cursor-pointer"
            >
              <option value="" disabled>Select Day</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          </div>
          {availableDaysInMonth.length > 0 &&(
            <div className="div flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[450px]">
            <label  className="text-[15px] text-greytextdark text-left mb-3">
           Select date
            </label>
         <div className="div p-3 shadow-md rounded-[10px]">
           <select
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="rounded-[10px] outline-none w-full bg-white text-center cursor-pointer"
           >
             <option value="" disabled>Select date</option>
             {availableDaysInMonth.map((data) => (
               <option key={data} value={data}>{data}</option>
             ))}
           </select>
         </div>
          </div>
          )}
         
          {selectedDay && (
             <div className="div flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[450px]">
               <label  className="text-[15px] text-greytextdark text-left mb-3">
              Select time
               </label>
            <div className="div p-3 shadow-md rounded-[10px]">
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="rounded-[10px] outline-none w-full bg-white text-center cursor-pointer"
              >
                <option value="" disabled>Select Time</option>
                {availability[selectedDay].map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
             </div>
          )}

          <div className="div  flex flex-col gap-2 w-[300px] m-auto pt-[20px] md:w-[450px]">
            <Select options={modes} label='Select a mode' onChange={(e) => setSelectedMode(e.target.value)} />
          </div>
          <div className="div w-[90%] m-auto">
            <File label='Attach medical files (if there is any)' type='file' onChange={(e) => setFile(e.target.files[0])} />
          </div>
          
          <TextArea placeholder='Describe your issue to the doctor in less than 300 words' onChange={(e) => setDescription(e.target.value)} />
          <div className="div w-[90%] p-5 m-auto mt-10">
            <Button3 text='Continue' bg='bg-blue' color='text-white' rounded='rounded-[10px]' width='w-[90%] m-auto' type='submit'  onClick= {handleBooking}/>
          </div>
        </form>
      </div>
    </>
  );
}
