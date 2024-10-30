import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Idioma = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('Español'); // Estado para el idioma seleccionado

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language); // Cambia el idioma seleccionado
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" />
        <Appbar.Content title="Idioma" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Lista de Idiomas */}
      <ScrollView>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.defaultText}>Idioma predeterminado</Text>
          <Text style={styles.selectedText}>Español</Text>
        </TouchableOpacity>
        <View style={styles.languages}>
          {languages.map((language, index) => (
            <TouchableOpacity
              key={index}
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.name)} // Selecciona el idioma
            >
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageText}>{language.name}</Text>
                <Text style={styles.languageSubText}>{language.subName}</Text>
              </View>
              {/* Muestra el check si el idioma está seleccionado */}
              {selectedLanguage === language.name && (
                <Icon name="check" size={20} color="#fff" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Lista de idiomas para mostrar en la pantalla
const languages = [
  { name: 'Albanés', subName: 'Albanés' },
  { name: 'Alemán', subName: 'Alemán' },
  { name: 'Հայերեն', subName: 'Armenio' },
  { name: 'বাংলা', subName: 'Bengali' },
  { name: 'Беларуская', subName: 'Bielorruso' },
  { name: 'ဗမာစာ', subName: 'Birmanés' },
  { name: 'Български', subName: 'Búlgaro' },
  { name: '中文', subName: 'Chino' },
  { name: '한국어', subName: 'Coreano' },
  { name: 'Hrvatski', subName: 'Croata' },
  { name: 'Dansk', subName: 'Danés' },
  { name: 'Scots', subName: 'Escocés' },
  { name: 'Slovenčina', subName: 'Eslovaco' },
  { name: 'Slovenščina', subName: 'Esloveno' },
  { name: 'Español', subName: 'Español' },
  { name: 'Esperanto', subName: 'Esperanto' },
  { name: 'Eesti', subName: 'Estoniano' },
  { name: 'Føroyskt', subName: 'Faroese' },
  { name: 'Wikang Filipino', subName: 'Filipino' },
  { name: 'Suomi', subName: 'Finlandés' },
  { name: 'Français', subName: 'Francés' },
  { name: 'Ελληνικά', subName: 'Griego' },
  { name: 'हिन्दी', subName: 'Hindi' },
  { name: 'Nederlands', subName: 'Holandés' },
  { name: 'Magyar', subName: 'Húngaro' },
  { name: 'English', subName: 'Ingles' },
  { name: 'English (Australia)', subName: 'Ingles (Australia)' },
  { name: 'English (United States)', subName: 'Ingles (Estados Unidos)' },
  { name: 'Bahasa Indonesia', subName: 'Indonés' },
  { name: 'Italiano', subName: 'Italiano' },
  { name: '日本語', subName: 'Japonés' },
  { name: 'ಕನ್ನಡ', subName: 'Kannada' },
  { name: 'Қазақ', subName: 'Kazakh' },
  { name: 'Lietuvių', subName: 'Lituano' },
  { name: 'Македонски', subName: 'Macedonio' },
  { name: 'Norsk', subName: 'Noruego' },
  { name: 'Polski', subName: 'Polaco' },
  { name: 'Português', subName: 'Portugués' },
  { name: 'Română', subName: 'Rumano' },
  { name: 'Русский', subName: 'Ruso' },
  { name: 'Српски', subName: 'Serbio' },
  { name: 'Svenska', subName: 'Sueco' },
  { name: 'ไทย', subName: 'Tailandés' },
  { name: 'Türkçe', subName: 'Turco' },
  { name: 'Українська', subName: 'Ucraniano' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Fondo oscuro
  },
  appBar: {
    backgroundColor: '#000',
  },
  appBarTitle: {
    color: '#fff',
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1e',
  },
  defaultText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 14,
    color: '#888',
  },
  languages: {
    marginTop: 10,
  },
  languageItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageTextContainer: {
    flex: 1,
  },
  languageText: {
    fontSize: 16,
    color: '#fff',
  },
  languageSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 1, // Espacio entre el idioma principal y el subtítulo
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default Idioma;
