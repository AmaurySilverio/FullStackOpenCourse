const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
  .connect(url)

  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        const parts = v.split("-");
        if (parts.length !== 2) return false;

        const [first, second] = parts;

        // Ensure both parts are digits
        const isDigitsOnly = (str) => {
          if (!str || str.length === 0) return false;

          for (let char of str) {
            if (char < "0" || char > "9") {
              return false;
            }
          }

          return true;
        };

        // Validate the first and second parts of the phone number
        const isFirstValid =
          first.length >= 2 && first.length <= 3 && isDigitsOnly(first);
        const isSecondValid = isDigitsOnly(second);

        return isFirstValid && isSecondValid;
      },
      message: (props) =>
        `${props.value} is not a valid phone number format! Expected format: XX-XXXX or XXX-XXXX`,
    },
    required: [true, "User phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
