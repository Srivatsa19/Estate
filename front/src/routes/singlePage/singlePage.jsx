import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useLoaderData, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useEffect, useRef, useState } from "react";
import apiRequests from "../../lib/apiRequests";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { format } from "timeago.js";
import { useNotificationStore } from "../../lib/notificationStore";

function SinglePage() {

  const post = useLoaderData();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext)
  const [saved, setSaved] = useState(post.isSaved);
  const [chat, setChat] = useState(null)
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();

  const decrease = useNotificationStore(state => state.decrease);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behaviour: "smooth"})
  }, [chat])

  const handleSave = async () => {
    setSaved((prev) => !prev)
    if (!currentUser) navigate("/login");
    try {
      await apiRequests.post("/users/save", {
        postId: post.id,
      })
    }
    catch (err) {
      console.log(err);
      setSaved((prev) => !prev)
    }
  }

  const handleClick = async () => {
    const res = await apiRequests.get("/chats/unique/" + post.userId)
    if (!res.data || res.data.length === 0) {
      await apiRequests.post("/chats", {
        receiverId: post.userId
      })
      const receiver = await apiRequests.get("/users/unique/" + post.userId)
      const reqData = receiver.data;
      setChat({ receiver: reqData })
    } else {
      try {
        const chatMessages = await apiRequests.get("/chats/" + res.data[0].id);
        if (!chatMessages.data.seenBy.includes(currentUser.id)) decrease();
        const receiverInfo = await apiRequests.get("/users/unique/" + post.userId)
        const reqData = receiverInfo.data;
        setChat({ ...chatMessages.data, receiver: reqData })
      }
      catch (err) {
        console.log(err);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text) return;
    try {
      const res = await apiRequests.post("/messages/" + chat.id, {
        text
      })
      setChat(prev => ({...prev, messages: [...prev.messages, res.data]}));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar || "/noavatar.jpg"} alt="" />
                <span>{post.user.username}</span>
              </div>
            </div>
            <div className="bottom" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.postDetail.desc) }}></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {
                  post.postDetail.utilities === "owner" ? (
                    <p>Owner is responsible</p>
                  ) : (
                    <p>Tenant is responsible</p>
                  )
                }
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? <p>Pets allowed</p> : <p>Pets not allowed</p>}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>{post.postDetail.school > 999 ? post.postDetail.school / 1000 + "km" : post.postDetail.school + "m"} away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          {chat && (
              <div className="chatBox">
                <div className="top">
                  <div className="user">
                    <img
                      src={chat.receiver.avatar || "noavatar.jpg"}
                      alt=""
                    />
                    {chat.receiver.username}
                  </div>
                  <span className="close" onClick={() => setChat(null)}>X</span>
                </div>
                <div className="center">
                  {chat?.messages?.map(message => (
                    <div className="chatMessage" style={{ alignSelf: message.userId === currentUser.id ? "flex-end" : "flex-start", textAlign: message.userId === currentUser.id ? "right" : "left" }} key={message.id}>
                      <p>{message.text}</p>
                      <span>{format(message.createdAt)}</span>
                    </div>
                  ))}
                  <div ref={messageEndRef}></div>
                </div>
                <form onSubmit={handleSubmit} className="bottom">
                  <textarea name="text"></textarea>
                  <button>Send</button>
                </form>
              </div>
            )}
          <div className="buttons">
            {post.userId !== currentUser.id && (<button onClick={handleClick}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>)}
            <button onClick={handleSave} style={{ backgroundColor: saved ? "#fece51" : "white" }}>
              <img src="/save.png" alt="" />
              {saved ? "Place saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
