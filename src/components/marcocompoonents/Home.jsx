import React, { useEffect, useState } from "react";
import { deletePost, fetchPostsWithComments, savePostForUser, unsavePostForUser } from "../../firebase/post";
import PostCard from "../microcomponents/PostCard";
import Pageload from "../microcomponents/Pageload"; // Replace with your loading indicator 
import { Loading } from "../microcomponents/textComponents";
import { useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { Nodata } from "../microcomponents/textComponents";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [userType, setUserType] = useState(null); // State to store user type
    const [userDetails, setUserDetails] = useState(null); // State to store user details
    const user = useSelector((state) => state.auth.user);
    const [savedPosts, setSavedPosts] = useState([])
    const navigate = useNavigate()
    useEffect(() => {
     if(user){
        const fetchUserData = async () => {
            // Function to determine user type and fetch user details
            const determineUserTypeAndFetchDetails = async (uid) => {
                try {
                    // Check if the user is an admin
                    const adminQuery = query(collection(db, 'admin'), where('uid', '==', uid));
                    const adminSnapshot = await getDocs(adminQuery);
                    
                    if (!adminSnapshot.empty) {
                        navigate('/pannel');
                        return { type: 'admin', details: adminSnapshot.docs[0].data() };
                    }
        
                    // Check if the user is a doctor
                    const doctorQuery = query(collection(db, 'doctors'), where('uid', '==', uid));
                    const doctorSnapshot = await getDocs(doctorQuery);
        
                    if (!doctorSnapshot.empty) {
                        navigate('/')
                        return { type: 'doctor', details: doctorSnapshot.docs[0].data() };
                    }
        
                    // Check if the user is a mother
                    const motherQuery = query(collection(db, 'mothers'), where('uid', '==', uid));
                    const motherSnapshot = await getDocs(motherQuery);
        
                    if (!motherSnapshot.empty) {
                        navigate('/')
                        return { type: 'mother', details: motherSnapshot.docs[0].data() };
                    }
                    
        
                    // Default user type if no match is found
                    return { type: 'unknown', details: null };
                } catch (error) {
                    console.error('Error determining user type: ', error);
                    return { type: 'unknown', details: null };
                }
            };

            // Fetch posts and user type
            fetchPostsWithComments((fetchedPosts) => {
                setPosts(fetchedPosts);
                // setLoading(false);
            });

            const { type, details } = await determineUserTypeAndFetchDetails(user);
            setUserType(type);
            setUserDetails(details);
            // console.log(type, details);
        };

        fetchUserData();
     }else{
        navigate('/User/sign-in');
     }
    }, [user]);

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(postId);
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        } catch (error) {
            // console.error('Error deleting post:', error);
        }
    };


    const handleSavePost = async (postId) => {
        try {
            if (!savedPosts.includes(postId)) {
                // Save the post for the current user
                await savePostForUser(user, postId);
                setSavedPosts([...savedPosts, postId]);
            } else {
                // Unsave the post for the current user
                await unsavePostForUser(user, postId);
                setSavedPosts(savedPosts.filter((id) => id !== postId));
            }
        } catch (error) {
            console.error('Error saving/unsaving post:', error);
        }
    };
    
    return (
        <div className="post w-full h-full overflow-y-auto">
          {posts.length===0 && loading ? <Pageload /> : console.log("Posts fetched:", posts.length)} 
            { posts.length===0? <Nodata text='There is no posts made yet, take this chance to make the first post.'/> : (
                posts.map((post) => (
                    <PostCard 
                        key={post.id}
                        userUid={user}
                        userDetails={userDetails}
                        postUid={post.uid}
                        Profilesrc={post.Profilesrc} 
                        AltProfile={'HB'} 
                        author={post.firstName + " " + post.secondName} 
                        role={post.role} 
                        time={post.time} 
                        following={post.following}  
                        text={post.content ? post.content : ""} 
                        imageSrc={post.imageUrls? post.imageUrls[0]: ""}
                        file={post.imageUrls && post.imageUrls[0]? true : false} 
                        fileType={post.imageUrls && post.imageUrls[0]? 'image' : 'video'} 
                        comments={post.comments}
                        postId={post.id}
                        handleSavePost={handleSavePost}
                        userType={userType}
                        handleDeletePost={handleDeletePost}
                        // videoType={post.videoType || 'video/mp4'}
                    />
                ))
            )}
        </div>
    );
}
