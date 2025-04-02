import Button from "./Button";
import Persons from "./Persons";

const Filter = ({ value, onChange, onClick, persons }) => {
  return (
    <>
      <div>
        search for name in phonebook:{" "}
        <input value={value} onChange={onChange} />
        <Button onClick={onClick} type="submit" text="search" />
      </div>
      <Persons persons={persons} title="Search Results" />
    </>
  );
};

export default Filter;
