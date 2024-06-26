import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { styles, buttonStyle } from "../microcomponents/textComponents";
import HeaderLogo from "../microcomponents/HeaderLogo";
import { Button3 } from "../microcomponents/RoundedButton";

export default function WaitingVerification() {
  const message = {
    mother: "To ensure your account's security and enable us to communicate effectively, please verify your email address. Check your inbox for our verification email. If not received, check spam.",
    doctor: "Your documents are currently under verification. We appreciate your patience and will respond by sending you an email soon. Thank you.",
  };
  const buttontext = {
    mother: 'Sign-in into account',
  };
  const altbuttontext = {
    out: 'Sign out of this account',
    in: 'Sign in with another account',
  };

  const userRole = useSelector((state) => state.auth.role);
  const [user, setUser] = useState('');
  const [color, setColor] = useState('');
  const [bg, setBg] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (userRole === 'doctor') {
      setUser(userRole);
      setColor('text-white');
    } else {
      setUser(userRole);
      setColor('text-blue');
      setText(buttontext.mother);
      setBg('bg-bluebutton');
    }
  }, [userRole]);

  return (
    <div className={`${styles}`}>
      <HeaderLogo head='Paedlyfe' />
      <div className={`${buttonStyle} bg-white rounded-[10px] shadow-lg p-5 mt-5`}>
        <p className="text-[13px] text-greytextdark md:text-[20px] ">
          {user === 'mother' ? message.mother : message.doctor}
        </p>
        <Button3 width='w-[60%] mt-5' color={color} bg={bg} text={text} link='/User/sign-in'/>
      </div>
      {user === 'doctor' ? (
        <div className={`${buttonStyle} mt-5`}>
          <Button3 width='w-full' color='text-blue' bg='bg-bluebutton' text={altbuttontext.in} link='User/sign-in'/>
  
        </div>
      ) : ''}
    </div>
  );
}
