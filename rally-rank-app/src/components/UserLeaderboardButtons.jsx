const UserLeaderboardButtons = ({ buttons, onTopClick, onOtherGenderClick, onMixedGenderClick, activeButton, setActiveButton }) => {
    const handleButtonClick = (index) => {
        setActiveButton(index);
        if (index === 0) {
            onTopClick();
        } else if (index === 1) {
            onOtherGenderClick();
        } else {
            onMixedGenderClick();
        }
    };

    return (
        <div className = "leaderboard-buttons flex gap-5 mb-4">
            {buttons.map((buttonLabel, index) => (
                <button
                    key = {index}
                    className = {`btn transition-colors duration-300 text-sm font-semibold ${
                        activeButton === index
                        ? "active-button underline text-primary-color-green"             // Active State
                        : "text-gray-700 hover:text-primary-color-light-green"               // Inactive State
                    }`}
                    onClick = {() => handleButtonClick(index)}
                >
                    {buttonLabel}
                </button>
            ))}
        </div>
    );
};

export default UserLeaderboardButtons;