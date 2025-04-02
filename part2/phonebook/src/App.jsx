import { useState, useEffect } from "react";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Filter from "./components/Filter";
import axios from "axios";
import personService from "./services/persons";
import Notification from "./components/Notification";

const App = ({ people }) => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newSearch, setNewSearch] = useState("");
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [color, setColor] = useState(false);

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const newContact = {
      name: newName,
      number: newNumber,
    };
    // Check if the contact already exists
    const existingPerson = persons.find(
      (person) => person.name === newContact.name
    );

    if (existingPerson && existingPerson.number === newContact.number) {
      // alert(`${newContact.name} is already added to the phonebook`);
      setErrorMessage(`${newContact.name} is already added to the phonebook`);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      setNewName("");
      setNewNumber("");
      return;
    }

    // If the contact exists but with a different number, ask for confirmation to update
    if (existingPerson && existingPerson.number !== newContact.number) {
      if (
        window.confirm(
          `${newContact.name} is already in the phonebook. Replace the old number with the new one?`
        )
      ) {
        const updatedContact = { ...existingPerson, number: newContact.number };

        // Update the contact
        personService
          .update(existingPerson.id, updatedContact)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            );
            setColor(true);
            setErrorMessage(`Updated ${newContact.name}'s Phone Number`);
            setTimeout(() => {
              setErrorMessage(null);
              setColor(false);
            }, 5000);
          })
          .catch((error) => {
            setErrorMessage(`Network Error. Please try again.`);
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
          });

        setNewName("");
        setNewNumber("");
      }
      return;
    }
    personService
      .create(newContact)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName("");
        setNewNumber("");
        setColor(true);
        setErrorMessage(`Added ${newContact.name}`);
        setTimeout(() => {
          setErrorMessage(null);
          setColor(false);
        }, 5000);
      })
      .catch((error) => {
        setErrorMessage(`Network Error. Please try again.`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });
  };

  const removeContact = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== id));
          // if (filteredCompanies.length > 0) {
          //   setFilteredCompanies(filteredCompanies.filter((c) => c.id !== id));
          // }
        })
        .catch((error) => {
          // console.log("Contact was already deleted from the server.");
          setPersons(persons.filter((p) => p.id !== id));
          setErrorMessage("Contact was already removed from server");
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          // if (filteredCompanies.length > 0) {
          //   setFilteredCompanies(filteredCompanies.filter((c) => c.id !== id));
          // }
        });
    } else {
      return;
    }
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };
  const handlePhonebookSearchChange = (event) => {
    console.log(event.target.value);
    setNewSearch(event.target.value);
  };
  const handlePhonebookSearchSubmit = (event) => {
    event.preventDefault();
    let filteredSearch = persons.filter((person) =>
      person.name.toLowerCase().includes(newSearch)
    );
    setFilteredPersons(filteredSearch);
    console.log(filteredSearch);
    setNewSearch("");
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} color={color} />
      <Filter
        value={newSearch}
        onChange={handlePhonebookSearchChange}
        onClick={handlePhonebookSearchSubmit}
        persons={filteredPersons}
      />
      <h3>Add Person To Phonebook</h3>
      <PersonForm
        onSubmit={handleFormSubmit}
        nameValue={newName}
        onNameChange={handleNameChange}
        numberValue={newNumber}
        onNumberChange={handleNumberChange}
      />
      <Persons
        persons={[...persons]}
        title="Numbers"
        handleRemoveContact={removeContact}
      />
    </div>
  );
};

export default App;
