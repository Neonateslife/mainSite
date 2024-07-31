import { MdVerifiedUser } from "react-icons/md";
import { RiDeleteBin4Line } from "react-icons/ri";
import { RotatingLines } from "react-loader-spinner";
import React from 'react';
import { Img } from 'react-image';
import VisibilitySensor from 'react-visibility-sensor';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { LiaCommentSolid } from "react-icons/lia";
import { CiShare1 } from "react-icons/ci";
import { IoSend } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useState } from "react";
import { addComment, deleteComment } from "../../firebase/post";
import TimeFormater from "./Formater";
import { serverTimestamp } from "firebase/firestore";

// the image component
const Loader = () => {
  return (
    <>
      <div className="loader bg-greytextfade w-full h-[400px] max-h-[400px] rounded-[20px] -z-50 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[max-content]">
          <RotatingLines
            visible={true}
            height="35"
            width="35"
            strokeWidth="5"
            animationDuration="1"
            ariaLabel="rotating-lines-loading"
            wrapperClass=""
          />
        </div>
      </div>
    </>
  );
};

const Image = (props) => {
  return (
    <>
      <VisibilitySensor>
        <Img src={props.src} className="w-full min-h-[200px] max-h-[400px] md:max-h-[600px] md:min-h-[250px] rounded-lg" loader={<Loader />} unloader={<Loader />} />
      </VisibilitySensor>
    </>
  );
};

// the video component
const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, srcs } = props;

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [srcs, options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div className="rounded-[20px]" ref={videoRef} />
    </div>
  );
};

// the message cards
const MessageDoctor = (props) => {
  const style = {
    fontSize: '20px',
    color: '#3b8aff'
  };
  const style2 = {
    fontSize: '20px',
    color: '#3d4652'
  };
  const ChatID = props.ChatUserId == props.ChatUserCurrent ? true : false;

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) {
      return name.charAt(0).toUpperCase();
    } else {
      return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    }
  };

  const initials = getInitials(props.ChatsenderName);

  const canDeleteComment = props.currentUserId === props.commentUserId || props.userType === 'admin';;

  return (
    <>
      <div className="header flex flex-row justify-normal px-3 gap-3 w-[max-content] max-w-[90%] md:max-w-[80%] " id={ChatID}>
        <div className="img rounded-[50%] w-[40px] h-[40px]  m-0 ">
          <Link to={props.profileLink} className='rounded-[50%] w-[40px] h-[40px]  m-0'>
            <img src={props.ChatsenderPicture} alt={initials} className={`p-0  w-full h-full  rounded-[50%] text-center text-[20px] text-greytextdark `} />
          </Link>
        </div>
        <div className="detailes w-full bg-white rounded-b-[20px] rounded-se-[20px] p-2 border-solid border-[1px] border-greytextfade ">
          <div className="controls flex flex-row justify-between">
            <ul className="flex flex-row justify-between gap-5 w-full">
              <li className=" w-[max-content] text-[15px] text-greytextdark font-bold">
                {props.ChatsenderName}
              </li>
              {props.Chatsenderrole === 'doctor' || props.Chatsenderrole === 'admin' ? <li className="w-[max-content]"><div className="verified"><MdVerifiedUser style={style} color={'#3b8aff'} /></div></li> : ''}
              <TimeFormater timestamp={props.Cahttime ? props.Cahttime : null} />
              {canDeleteComment && (
                <RiDeleteBin4Line
                  style={style2}
                  className="icon-small"
                  onClick={() => props.handleDeleteComment(props.commentId)}
                />
              )}
            </ul>
          </div>
          <div className="postText w-full">
            <p className="m-0 pb-2 text-[13px] lg:text-black lg:text-[15px]">{props.Chattext}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default function PostCard(props) {
  const style = {
    fontSize: '25px',
    color: '#3b8aff'
  };
  const style2 = {
    fontSize: '25px',
    color: '#3d4652'
  };

  const [comment, setComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(props.comments || []);

  const toggleCommentSection = () => {
    setComment(!comment);
  };

  const handleAddComment = async () => {
    // if (comment.trim() !== '') {
    const commentData = { // Renamed to 'commentData'
      uid: props.userUid,
      comment: newComment, // Use the state variable here
      postId: props.postId,
      // role: props.userDetails.role,
      firstName: props.userDetails.firstName,
      secondName: props.userDetails.secondName,
      timestamp: serverTimestamp(),
      time: new Date().toISOString(),
    };

    try {
      await addComment(props.postId, commentData);
      setComments((prevComments) => [...prevComments, commentData]);
      setNewComment(''); // Clear the input field
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    // }
  };

  const handleDeletePost = async () => {
    try {
      await props.handleDeletePost(props.postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  const canDelete = props.userUid === props.postUid || props.userType === 'admin';
  return (
    <>
      <div className="border-y-[1px] border-x-greytextfade pt-5 w-full -z-50">
        <div className="header flex flex-row justify-between px-3 gap-3">
          <div className="img rounded-[50%] w-[40px] h-[40px] m-0">
            <Link to={props.profileLink} className='rounded-[50%] w-[40px] h-[40px] m-0'>
              <img src={props.Profilesrc} alt={props.AltProfile} className="p-0 w-full h-full rounded-[50%] text-center font-bold text-greytextfade text-[20px]" />
            </Link>
          </div>
          <div className="detailes w-full">
            <div className="controls flex flex-row justify-between">
              <ul className="flex flex-row justify-between w-full">
                <li className="w-[max-content] text-[15px] text-greytextdark font-bold">
                  {props.author}
                </li>
                {props.role === 'doctor' || props.role === 'admin' ? (
                  <li className="w-[max-content]">
                    <div className="verified">
                      <MdVerifiedUser style={style} color={'#3b8aff'} />
                    </div>
                  </li>
                ) : ''}
                <li className="w-[max-content] text-[15px] text-greytextfade">
                  {props.time}
                </li>
              </ul>
            </div>
            <div className="postText w-full py-4">
              <span className="m-0 p-0 text-[13px] break-all lg:text-black lg:text-[15px]">{props.text}</span>
            </div>
            {props.file ? (
              <div className="postFile w-full min-w-[min-content] bg-gray-300 rounded-lg border-[1px] border-greytextfade">
                {props.fileType === 'image' ? (
                  <Image src={props.imageSrc} alt="Post file" className="rounded-lg" />
                ) : (
                  <video src={props.videoSrc} controls className="w-full rounded-[15px]" />
                )}
              </div>
            ) : ''}
            <div className="postcontrol flex flex-row justify-between p-3">
              <span className="flex gap-[5px]" onClick={toggleCommentSection}>
                <LiaCommentSolid style={style2} className="icon-small" />
                <div className="bagde w-[max-content] h-[max-content] p-[1px] text-[15px] mt-1">
                  {comments.length ? (comments.length >= 1000 ? '1000+' : comments.length) : ''}
                </div>
              </span>
              <CiShare1 style={style2} className="icon-small" onClick={() => props.handleSavePost(props.postId)} />
              {canDelete && <RiDeleteBin4Line style={style2} className="icon-small" onClick={handleDeletePost} />}
            </div>
          </div>
        </div>
        {comment && (
          <div className="comments w-full h-[400px] align-middle  border-t-[1px] border-t-greytextfade">
            <div className="chats w-[90%] flex flex-col gap-2 m-auto p-3 h-[440px] md:h-[540px] overflow-y-auto overflow-x-hidden">
              {comments.map(comment => (
                <MessageDoctor
                  key={comment.id}
                  Chattext={comment.comment}
                  ChatsenderName={comment.firstName + ' ' + comment.secondName}
                  // Cahttime={new Date(comment.timestamp.seconds ? comment.timestamp.seconds * 1000 : comment.timestamp).toLocaleString() || "o"}
                  ChatsenderPicture={comment.ChatsenderPicture}
                  Chatsenderrole={comment.role}
                  commentId={comment.id} // Pass comment ID
                  currentUserId={props.userUid} // Pass current user ID
                  commentUserId={comment.uid} // Pass comment author ID
                  handleDeleteComment={handleDeleteComment} // Pass delete comment handler
                  userType={props.userType}
                />
              ))}
            </div>
            <div className="input p-3 flex flex-row justify-between w-full bg-gray-100">
              <input
                type="text"
                className="w-[87%] rounded-[20px] h-[45px] px-3 text-gray-800"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <span className="h-[max-content] m-auto" onClick={handleAddComment}>
                <IoSend style={style2} />
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
