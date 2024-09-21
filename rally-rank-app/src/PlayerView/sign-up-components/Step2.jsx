import PropTypes from "prop-types";

const Step2 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Personal Information</h2>
    <p>We love to know more about you!</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="firstName"
            placeholder="First Name"
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          <p className="error">{errors.firstName?.message}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            className="border p-2"
            type="text"
            id="lastName"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          <p className="error">{errors.lastName?.message}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700"
        >
          Gender
        </label>
        <select
          className="border p-2"
          id="gender"
          {...register("gender", {
            required: "Gender is required",
          })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <p className="error">{errors.gender?.message}</p>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="dob"
          className="block text-sm font-medium text-gray-700"
        >
          Date of Birth
        </label>
        <input
          className="border p-2"
          type="date"
          id="dob"
          {...register("dob", {
            required: "Date of birth is required",
          })}
        />
        <p className="error">{errors.dob?.message}</p>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          className="border p-2"
          type="number"
          id="phone"
          placeholder="Phone Number"
          {...register("phone", {
            required: "Phone number is required",
          })}
        />
        <p className="error">{errors.phone?.message}</p>
      </div>
    </div>
  </div>
);

Step2.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    firstName: PropTypes.object,
    lastName: PropTypes.object,
    gender: PropTypes.object,
    dob: PropTypes.object,
    phone: PropTypes.object,
  }).isRequired,
};

export default Step2;
