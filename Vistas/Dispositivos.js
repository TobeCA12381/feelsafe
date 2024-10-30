// MisDispositivos.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton, Avatar, Menu, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Dispositivos = () => {
  const navigation = useNavigation();

  // Datos de ejemplo de dispositivos
  const [devices, setDevices] = useState([
    { id: '1', name: 'iPhone 12', type: 'phone', lastUsed: 'Hoy, 10:00 AM' },
    { id: '2', name: 'Samsung Galaxy S21', type: 'phone', lastUsed: 'Ayer, 2:30 PM' },
    { id: '3', name: 'MacBook Pro', type: 'laptop', lastUsed: 'Hace 1 semana, 8:45 AM' },
  ]);
  const [visibleMenu, setVisibleMenu] = useState(null);

  const openMenu = (id) => setVisibleMenu(id);
  const closeMenu = () => setVisibleMenu(null);

  const handleDelete = (id) => {
    setDevices(devices.filter(device => device.id !== id));
    closeMenu();
  };
  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <Avatar.Icon size={40} icon={item.type === 'phone' ? 'cellphone' : 'laptop'} style={styles.avatar} />
        <View style={styles.deviceDetails}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.lastUsed}>{item.lastUsed}</Text>
        </View>
      </View>
      {/* Menú para cada dispositivo */}
      <Menu
        visible={visibleMenu === item.id}
        onDismiss={closeMenu}
        anchor={
          <IconButton icon="dots-vertical" size={24} onPress={() => openMenu(item.id)}/>
        }
      >
        <Menu.Item onPress={() => handleDelete(item.id)} title="Eliminar" />
      </Menu>
    </TouchableOpacity>
  );

  return (
    <Provider>
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Mis Dispositivos</Text>
      </View>
      <Text style={styles.infoText}>
        Si desactivas un dispositivo, deberás iniciar sesión nuevamente para poder usarlo.
      </Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        style={styles.deviceList}
      />
    </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#fff',
  },
  deviceList: {
    marginTop: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#d3d3d3',
  },
  deviceDetails: {
    marginLeft: 10,
  },
  deviceName: {
    fontSize: 16,
    color: '#fff',
  },
  lastUsed: {
    fontSize: 14,
    color: '#aaa',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});

export default Dispositivos;
