import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import axios from 'axios';
import firebaseConfig from './firebaseConfig';

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

const Api = {
  // FacebookPopup: async () => {
  //   const provider = new firebase.auth.FacebookAuthProvider();
  //   let result = null;
  //   try {
  //     result = await firebaseApp.auth().signInWithPopup(provider);
  //   } catch (e) {
  //     console.error('Erro na autenticacao.', e);
  //   }
  //   return result;
  // },
  mongoPopup: async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/user/login", data)
      return res.data[0]
    } catch (error) {
      console.log(error)
    }

  },
  // GithubPopup: async () => {
  //   const provider = new firebase.auth.GithubAuthProvider();
  //   let result = null;
  //   try{
  //     result = await firebaseApp.auth().signInWithPopup(provider);
  //   }catch(e){
  //     console.error('Erro na autenticacao.', e);
  //   }
  //   return result;
  // },
  // GooglePopup: async () => {
  //   const provider = new firebase.auth.GoogleAuthProvider();
  //   let result = null;
  //   try{
  //     result = await firebaseApp.auth().signInWithPopup(provider);
  //   }catch(e){
  //     console.error('Erro na autenticacao.', e);
  //   }
  //   return result;
  // },
  addUser: async (u) => {///נבצע משלנו לאחר מסך התחברות
    await db.collection('users').doc(u.id).set({
      name: u.name,
      avatar: u.avatar
    }, { merge: true });
  },
  getContactList: async (userId) => {
    // מקבל את כל החברים
    const res = await axios.post("http://localhost:5000/api/user/userContact", {
      email: userId
    })
    return res.data
  },


  addNewChat: async (user, userChat, setActiveChat) => {
    try {


      const res = await axios.post("http://localhost:5000/api/chat/newChat", {
        userId: user.id,
        userChatId: userChat.id
      })

      setActiveChat({ chatId: res.data, title: userChat.name, image: userChat.avatar, with: userChat.id });




      // let newChat = await db.collection('chats').add({
      //   messages: [],
      //   users: [user.id, userChat.id]
      // });

      // db.collection('users').doc(user.id).update({
      //   chats: firebase.firestore.FieldValue.arrayUnion({
      //     chatId: newChat.id,
      //     title: userChat.name,
      //     image: userChat.avatar,
      //     with: userChat.id
      //   })
      // });

      // db.collection('users').doc(userChat.id).update({
      //   chats: firebase.firestore.FieldValue.arrayUnion({
      //     chatId: newChat.id,
      //     title: user.name,
      //     image: user.avatar,
      //     with: user.id
      //   })
      // });
      // setActiveChat({ chatId: newChat.id, title: userChat.name, image: userChat.avatar, with: userChat.id });
    } catch (error) {
      console.log(error)
    }
  },
  onChatList: (userId, setChatList) => {
    return db.collection('users').doc(userId).onSnapshot(doc => {
      if (doc.exists) {
        let data = doc.data();
        if (data.chats) {
          let chats = [...data.chats];
          // chats.sort((a,b) => {
          //   if(!a.lastMessageDate) return false
          //   if(a.lastMessageDate === undefined){
          //     return -1;
          //   }
          //   if(!a.lastMessageDate.seconds) return false
          //   if(a.lastMessageDate.seconds < b.lastMessageDate.seconds){
          //     return 1;
          //   }else{
          //     return -1;
          //   }
          // });

          setChatList(chats);
        }
      }
    });
  },
  onChatContent: (chatId, setList, setUsers) => {
    return db.collection('chats').doc(chatId).onSnapshot(doc => {
      if (doc.exists) {
        let data = doc.data();
        setList(data.messages);
        setUsers(data.users);
      }
    })
  },
  sendMessage: async (chatData, userId, type, body, users) => {
    console.log({ chatData, userId, type, body, users })
    let now = new Date();
    db.collection('chats').doc(chatData.chatId).update({
      messages: firebase.firestore.FieldValue.arrayUnion({
        type,
        author: userId,
        body,
        date: now
      })
    });

    for (let i in users) {
      let u = await db.collection('users').doc(users[i]).get();
      let uData = u.data();
      if (uData.chats) {
        let chats = [...uData.chats];
        for (let e in chats) {
          if (chats[e].chatId === chatData.chatId) {
            chats[e].lastMessage = body;
            chats[e].lastMessageDate = now;
          }
        }

        await db.collection('users').doc(users[i]).update({
          chats
        })
      }
    }
  }
}

export default Api;