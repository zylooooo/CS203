import PropTypes from "prop-types";

const Step2 = ({ register, errors }) => (
  <div className="flex flex-col justify-center">
    <h2 className="text-xl font-extrabold">Personal Information</h2>
    <p>We love to know more about you!</p>
    <div className="flex flex-col gap-5 mt-8 justify-center">

      {/* ADMINNAME INPUT */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="adminName"
          className="block text-sm font-medium text-gray-700"
        >
          Admin Username
        </label>
        <input
          className="border p-2"
          type="text"
          id="adminName"
          placeholder="Enter your RallyRank Admin username"
          {...register("adminName", {
            required: "An Admin username is required.",
            minLength: {
              value: 5,
              message: "Admin Username must be at least 5 characters long",
            },
            maxLength: {
              value: 20,
              message: "Admin Username cannot exceed 20 characters.",
            },
            pattern: {
              value: /^[a-zA-Z0-9_]*$/,
              message:
                "Admin Username can only contain letters, numbers and underscores.",
            },
          })}
        />
        <p className="error"> {errors.adminName?.message} </p>
      </div>

      {/* FIRST NAME & LAST NAME INPUT */}
      <div className="flex gap-5 justify-center">
        <div className="flex flex-col gap-1 w-1/2">
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
        <div className="flex flex-col gap-1 w-1/2">
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

    </div>
  </div>
);

Step2.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    adminName: PropTypes.object,
    firstName: PropTypes.object,
    lastName: PropTypes.object,
  }).isRequired,
};

export default Step2;
