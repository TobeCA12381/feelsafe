import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Chat = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]); // Estado para manejar los mensajes
  const [newMessage, setNewMessage] = useState(''); // Estado para manejar el mensaje que se escribe

  const handleBackPress = () => {
    navigation.navigate('Seguridad'); // Regresa a la ruta de tu menú principal
  };

  // Simula el envío de un mensaje
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prevMessages => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: newMessage, sender: 'user' }
      ]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.systemMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" left={10}/>
        <Appbar.Content title="Chat de Emergencia" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Lista de mensajes */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messageList}
        inverted // Invierte la lista para que los mensajes recientes aparezcan abajo
      />

      {/* Entrada para escribir el mensaje */}
      <View style={styles.inputContainer}>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://img.icons8.com/?size=100&id=TXIdRxwbdYXP&format=png&color=000000' }} // Imagen de adjuntar desde una URL
            style={styles.iconImage}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe tu mensaje"
          placeholderTextColor="#ccc"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Image
            source={{ uri: 'https://img.icons8.com/?size=100&id=40007&format=png&color=000000' }} // Imagen de enviar desde una URL
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  appBar: {
    backgroundColor: '#2b2b2b',
    left: 30
  },
  appBarTitle: {
    color: '#fff',
    left: 15
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  iconImage: {
    width: 30,
    height: 30,
    marginLeft: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: '#2b2b2b',
    color: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  message: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
  },
  userMessage: {
    backgroundColor: '#4caf50',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  systemMessage: {
    backgroundColor: '#444',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Chat;
