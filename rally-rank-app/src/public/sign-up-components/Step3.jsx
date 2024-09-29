import PropTypes from "prop-types";

const Step3 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Tennis Details</h2>
    <p>Share with us your tennis details and experience!</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700"
        >
          Elo Rating
        </label>
        <input
          className="border p-2"
          type="number"
          id="elo"
          placeholder="0"
          {...register("elo", {})}
        />
        <p className="text-sm font-xs text-gray-700">
          *Leave this blank if you are unranked
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="yearsOfExperience"
          className="text-sm font-medium text-gray-700"
        >
          Years of Experience
        </label>
        <input
          className="border p-2"
          type="number"
          id="YearsOfExperience"
          placeholder="0"
          min="0"
          {...register("YearsOfExperience", {
            required: "Years of Experience is required",
          })}
        />
        <p className="error">{errors.YearsOfExperience?.message}</p>
      </div>
    </div>
  </div>
);

Step3.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    elo: PropTypes.object,
    YearsOfExperience: PropTypes.object,
  }).isRequired,
};

export default Step3;
