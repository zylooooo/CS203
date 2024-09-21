import PropTypes from "prop-types";

const Step6 = ({ register, errors, watch }) => (
  <div>
    <h2 className="text-xl font-extrabold">Account Setup</h2>
    <p>Last stage! Please choose a password</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          className="border p-2"
          type="password"
          id="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
        />
        <p className="error">{errors.password?.message}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          className="border p-2"
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          {...register("confirmPassword", {
            required: "Password is required",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
        />
        <p className="error">{errors.confirmPassword?.message}</p>
      </div>
    </div>
  </div>
);

Step6.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    password: PropTypes.object,
    confirmPassword: PropTypes.object,
  }).isRequired,
  watch: PropTypes.func.isRequired,
};

export default Step6;
