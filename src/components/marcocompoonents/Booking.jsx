import React, { useState } from "react";
import HeadWithBack from "../microcomponents/HeadWithBack";
import { Date, Time, File, TextArea } from "../microcomponents/textComponents";
import { Button3 } from "../microcomponents/RoundedButton";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

export default function Booking() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleBooking = async (event) => {
    event.preventDefault();

    try {
      await addDoc(collection(db, "bookings"), {
        day: selectedDay,
        time: selectedTime,
        mode: selectedMode,
        file: file ? file.name : '',
        description: description,
      });
      alert("Booking successful!");
      navigate('/appointment/doctor/checkout');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const days = [
    {
      day: 'Sun',
      hours: ['20:30-22:30', '23:30-00:00']
    },
    {
      day: 'Mon',
      hours: ['20:30-22:30', '23:30-00:00']
    },
    {
      day: 'Tue',
      hours: ['20:30-22:30', '23:30-00:00,']
    },
    {
      day: 'Wed',
      hours: ['23:30-00:00']
    },
    {
      day: 'Thur',
      hours: ['20:30-22:30', '23:30-00:00']
    },
    {
      day: 'Fri',
      hours: ['20:30-22:30', '23:30-00:00', '24:01-00:30', '01:30-02:00']
    },
    {
      day: 'Sat',
      hours: ['20:30-22:30', '23:30-00:00']
    },
  ];

  const modes = ['Physical', 'Online'];

  return (
    <>
      <HeadWithBack heading="Booking Appointment" />
      <div className="div w-[90%] m-auto pt-10">
        <div className="div relative -z-50 w-[70px] h-[70px] rounded-[50%] m-auto md:w-[150px] md:h-[150px]">
          <img src="https://picsum.photos/200/300" className="w-full h-full rounded-[50%] border-" alt="loading" loading='lazy' />
          <span className="w-[max-content] h-[max-content] absolute top-[0px] right-[10px]">
          </span>
        </div>
        <form onSubmit={handleBooking} className="w-full">
          <div className="div w-[90%] m-auto">
            <Date days={days} label='Select a day' onChange={(e) => setSelectedDay(e.target.value)} />
          </div>
          <div className="div flex flex-col md:flex-row justify-between gap-[30px] w-[90%] m-auto">
            <Time time={days[5].hours} label='Select time' onChange={(e) => setSelectedTime(e.target.value)} />
            <Time time={modes} label='Select a mode' onChange={(e) => setSelectedMode(e.target.value)} />
          </div>
          <div className="duv w-[90%] m-auto">
            <File label='Attach medical files (if there is any)' type='file' onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <TextArea placeholder='Describe your issue to the doctor in less than 300 words' onChange={(e) => setDescription(e.target.value)} />
          <div className="div w-[90%] p-5 m-auto mt-10">
            <Button3 text='Continue' bg='bg-blue' color='text-white' rounded='rounded-[10px]' width='w-[90%] m-auto' onClick={handleBooking}/>
          </div>
        </form>
      </div>
    </>
  );
}
