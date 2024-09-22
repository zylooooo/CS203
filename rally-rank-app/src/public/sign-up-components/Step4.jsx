import PropTypes from "prop-types";

const Step4 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Medical Information</h2>
    <p>Please enter the relevant health details</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bloodType"
          className="block text-sm font-medium text-gray-700"
        >
          Please enter your blood type
        </label>
        <input
          className="border p-2"
          type="text"
          id="bloodType"
          placeholder="O+, A, AB"
          {...register("bloodType", {
            required: "Blood type is required",
          })}
        />
        <p className="error">{errors.bloodType?.message}</p>
      </div>

      <h3 className="pt-5 text-xl font-extrabold">Emergency contact details</h3>
      <div className="flex gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="emergencyContactFirstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="emergencyContactFirstName"
            placeholder="First Name"
            {...register("emergencyContactFirstName", {
              required: "First name is required",
            })}
          />
          <p className="error">{errors.emergencyContactFirstName?.message}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="emergencyContactLastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="emergencyContactLastName"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          <p className="error">{errors.emergencyContactLastName?.message}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="emergencyPhoneNo"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          className="border p-2"
          type="number"
          id="emergencyPhoneNo"
          placeholder="E.g. 84924832"
          {...register("emergencyPhoneNo", {
            required: "Emergency contact phone number is required",
          })}
        />
        <p className="error">{errors.emergencyPhoneNo?.message}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="emergencyRelationship"
          className="block text-sm font-medium text-gray-700"
        >
          Relationship
        </label>
        <input
          className="border p-2"
          type="text"
          id="emergencyRelationship"
          placeholder="Mother, Father, Sister, etc."
          {...register("emergencyRelationship", {
            required: "Relationship for emergency contact is required",
          })}
        />
        <p className="error">{errors.emergencyRelationship?.message}</p>
      </div>
    </div>
  </div>
);

Step4.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    bloodType: PropTypes.object,
    emergencyContactFirstName: PropTypes.object,
    emergencyContactLastName: PropTypes.object,
    emergencyPhoneNo: PropTypes.object,
    emergencyRelationship: PropTypes.object,
  }).isRequired,
};

export default Step4;
