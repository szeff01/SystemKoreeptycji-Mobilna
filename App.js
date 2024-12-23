import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Stan dla admina
  const [isRegister, setIsRegister] = useState(true);

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        isAdmin ? (
          <AdminPanel onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <UserPanel onLogout={() => setIsLoggedIn(false)} />
        )
      ) : isRegister ? (
        <RegisterForm onSwitch={() => setIsRegister(false)} />
      ) : (
        <LoginForm
          onSwitch={() => setIsRegister(true)}
          onLogin={(isAdmin) => {
            setIsLoggedIn(true);
            setIsAdmin(isAdmin);
          }}
        />
      )}
    </View>
  );
}

function UserPanel({ onLogout }) {
  const [tutors, setTutors] = useState([]); // Lista korepetytorów (na razie pusta)

  const handleSearch = (query) => {
    Alert.alert("Wyszukiwanie", `Szukasz: ${query}`);
    // W przyszłości tutaj można dodać logikę do filtrowania korepetytorów
  };

  return (
    <View style={styles.userPanelContainer}>
      {/* Pasek górny */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eduksy</Text>
        <View style={styles.headerButtons}>
          <Button title="Moje rezerwacje" onPress={() => {}} />
          <Button title="Wyloguj" onPress={onLogout} />
        </View>
      </View>

      {/* Wyszukiwarka */}
      <SearchBar onSearch={handleSearch} />

      {/* Lista korepetytorów */}
      <View style={styles.tutorsSection}>
        <Text style={styles.sectionTitle}>Polecane</Text>
        {tutors.length > 0 ? (
          <ScrollView horizontal style={styles.tutorsScroll}>
            {tutors.map((tutor, index) => (
              <View key={index} style={styles.tutorCard}>
                <Text style={styles.tutorName}>{tutor.name}</Text>
                <Text style={styles.tutorDetails}>
                  Cena: {tutor.price} zł/h
                </Text>
                <Text style={styles.tutorDetails}>
                  Lokalizacja: {tutor.location}
                </Text>
                <Text style={styles.tutorDetails}>
                  Kategorie: {tutor.category}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noTutorsText}>Brak korepetytorów</Text>
        )}
      </View>
    </View>
  );
}


function SearchBar({ onSearch }) {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    onSearch(searchText);
  };

  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>Znajdź nauczyciela</Text>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj po kategoriach"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Button title="Szukaj" onPress={handleSearch} />
      </View>
    </View>
  );
}

function TutorList({ tutors }) {
  return (
    <View style={styles.tutorListContainer}>
      <Text style={styles.tutorListTitle}>Polecane</Text>
      {tutors && tutors.length > 0 ? (
        <ScrollView horizontal style={styles.tutorScroll}>
          {tutors.map((tutor, index) => (
            <View key={index} style={styles.tutorCard}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.tutorDetails}>Cena: {tutor.price} zł/h</Text>
              <Text style={styles.tutorDetails}>Lokalizacja: {tutor.location}</Text>
              <Text style={styles.tutorDetails}>Kategorie: {tutor.category}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noTutorsText}>Brak korepetytorów</Text>
      )}
    </View>
  );
}



function AdminPanel({ onLogout }) {
  const [isAddingTutor, setIsAddingTutor] = useState(false);
  const [tutors, setTutors] = useState([]); // Tutors list
  const [searchQuery, setSearchQuery] = useState("");

  const [tutorData, setTutorData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    price: "",
    description: "",
    location: "Online",
    imageUrl: "",
    category: "",
    availability: [],
  });

  // Fetch tutors on component mount
  useEffect(() => {
    fetchTutors();
  }, []);

  const handleInputChange = (field, value) => {
    setTutorData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchTutors = async () => {
    try {
      const response = await fetch("http://10.0.2.2:5001/tutors/");
      if (!response.ok) throw new Error("Błąd podczas pobierania korepetytorów.");
      const data = await response.json();
      setTutors(data); // Update the tutors list
    } catch (error) {
      console.error("Błąd pobierania korepetytorów:", error);
      Alert.alert("Błąd", "Nie udało się załadować listy korepetytorów.");
    }
  };

  const handleAddTutor = async () => {
    if (
      !tutorData.firstName ||
      !tutorData.lastName ||
      !tutorData.phone ||
      !tutorData.price ||
      !tutorData.description
    ) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie wymagane pola!");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:5001/tutors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorData),
      });

      if (!response.ok) throw new Error("Błąd podczas dodawania korepetytora.");

      const data = await response.json();
      Alert.alert("Sukces", "Korepetytor został dodany!");
      setTutors((prevTutors) => [...prevTutors, data.tutor]); // Update tutors list
      setIsAddingTutor(false); // Close the form
      setTutorData({
        firstName: "",
        lastName: "",
        phone: "",
        price: "",
        description: "",
        location: "Online",
        imageUrl: "",
        category: "",
        availability: [],
      });
    } catch (error) {
      console.error("Błąd dodawania korepetytora:", error);
      Alert.alert("Błąd", "Nie udało się dodać korepetytora.");
    }
  };

  return (
    <View style={styles.adminPanelContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Administrator</Text>
        <View style={styles.headerButtons}>
          <Button title="Dodaj korepetytora" onPress={() => setIsAddingTutor(true)} />
          <Button title="Wyloguj" onPress={onLogout} />
        </View>
      </View>

      {/* Search Bar */}
      {!isAddingTutor && <SearchBar onSearch={handleSearch} />}

      {/* Tutor Form */}
      {isAddingTutor ? (
        <ScrollView style={styles.form}>
          <Text style={styles.title}>Dodaj Korepetytora</Text>
          <TextInput
            style={styles.input}
            placeholder="Imię"
            value={tutorData.firstName}
            onChangeText={(value) => handleInputChange("firstName", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Nazwisko"
            value={tutorData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon"
            value={tutorData.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Cena za godzinę"
            value={tutorData.price}
            onChangeText={(value) => handleInputChange("price", value)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.textarea}
            placeholder="Opis"
            value={tutorData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="URL zdjęcia"
            value={tutorData.imageUrl}
            onChangeText={(value) => handleInputChange("imageUrl", value)}
          />
          <Text style={styles.label}>Lokalizacja:</Text>
          <Picker
            selectedValue={tutorData.location}
            style={styles.picker}
            onValueChange={(itemValue) => handleInputChange("location", itemValue)}
          >
            <Picker.Item label="Online" value="Online" />
            <Picker.Item label="Stacjonarnie" value="Offline" />
          </Picker>
          <Text style={styles.label}>Kategoria:</Text>
          <Picker
            selectedValue={tutorData.category}
            style={styles.picker}
            onValueChange={(itemValue) => handleInputChange("category", itemValue)}
          >
            <Picker.Item label="Matematyka" value="Matematyka" />
            <Picker.Item label="Język Angielski" value="Angielski" />
            <Picker.Item label="Fizyka" value="Fizyka" />
          </Picker>

          <Button title="Dodaj Korepetytora" onPress={handleAddTutor} />
          <Button title="Anuluj" onPress={() => setIsAddingTutor(false)} />
        </ScrollView>
      ) : (
        /* Tutors List */
        <View style={styles.tutorsSection}>
          <Text style={styles.sectionTitle}>Polecane</Text>
          {filteredTutors.length > 0 ? (
            <ScrollView horizontal style={styles.tutorsScroll}>
              {filteredTutors.map((tutor, index) => (
                <View key={index} style={styles.tutorCard}>
                  <Text style={styles.tutorName}>{`${tutor.firstName} ${tutor.lastName}`}</Text>
                  <Text style={styles.tutorDetails}>
                    Cena: {tutor.price} zł/h
                  </Text>
                  <Text style={styles.tutorDetails}>
                    Lokalizacja: {tutor.location}
                  </Text>
                  <Text style={styles.tutorDetails}>
                    Kategorie: {tutor.category}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noTutorsText}>Brak korepetytorów</Text>
          )}
        </View>
      )}
    </View>
  );
}





function RegisterForm({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola!");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:5001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        Alert.alert("Błąd", error.error || "Wystąpił błąd.");
        return;
      }

      const data = await response.json();
      Alert.alert("Sukces", data.message || "Zarejestrowano pomyślnie!");
      onSwitch();
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Rejestracja</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Zarejestruj się" onPress={handleRegister} />
      <Text style={styles.link}>
        Masz już konto?{" "}
        <Text style={styles.linkText} onPress={onSwitch}>
          Zaloguj się
        </Text>
      </Text>
    </View>
  );
}

function LoginForm({ onSwitch, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola!");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        Alert.alert("Błąd", error.error || "Wystąpił błąd.");
        return;
      }

      const data = await response.json();
      Alert.alert("Sukces", `Zalogowano pomyślnie jako: ${data.user.username}`);
      onLogin(data.user.email === "admin@gmail.com");
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Logowanie</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Zaloguj się" onPress={handleLogin} />
      <Text style={styles.link}>
        Nie masz konta?{" "}
        <Text style={styles.linkText} onPress={onSwitch}>
          Zarejestruj się
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ogólne style kontenera
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },

  // Formularz
  form: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },

  // Picker
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },

  // Linki
  link: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },

  // Panel użytkownika
  userPanelContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  // Styl wyszukiwarki
  searchContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },

  // Lista korepetytorów
  tutorListContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tutorListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  tutorScroll: {
    flexDirection: "row",
  },
  tutorCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tutorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  tutorDetails: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  noTutorsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },

  // Styl dla panelu administratora
  adminPanelContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  tutorsSection: {
    marginTop: 20,
  },
});
