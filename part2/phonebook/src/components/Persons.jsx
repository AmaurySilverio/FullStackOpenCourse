import Button from "../components/Button";

const Persons = ({ persons, title, handleRemoveContact }) => {
  return (
    <>
      <h3>{title}</h3>
      <div>
        {persons.map((person) => (
          <div className="contact-details" key={person.id}>
            <p>
              {person.name}: {person.number}
            </p>
            <Button
              type="button"
              text="delete"
              onClick={() => handleRemoveContact(person.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Persons;
