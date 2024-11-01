'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

const DEFAULT_DURATION = 0.3;
const DEFAULT_EASE_TYPE = 'linear';
const DEFAULT_DIRECTION = 'normal';
const DEFAULT_FILLMODE = 'none';
const RUNNING = 'running';
const PAUSED = 'paused';
const ALL = 'all';

var calculateTotalDuration = ({ duration = DEFAULT_DURATION, delay = 0, overlay = 0, }) => duration + delay - overlay || 0;

var isUndefined = (val) => val === undefined;

function getSequenceId(sequenceIndex, sequenceId, defaultValue) {
    if (isUndefined(sequenceId) && isUndefined(sequenceIndex)) {
        return defaultValue || 0;
    }
    if (sequenceIndex && sequenceIndex >= 0) {
        return sequenceIndex;
    }
    if (sequenceId) {
        return sequenceId;
    }
    return 0;
}

const AnimateContext = React__namespace.createContext({
    animationStates: {},
    register: () => { },
});
function AnimateGroup({ play, sequences = [], children, }) {
    const [animationStates, setAnimationStates] = React__namespace.useState({});
    const animationsRef = React__namespace.useRef({});
    const register = React__namespace.useCallback((data) => {
        const { sequenceIndex, sequenceId } = data;
        if (!isUndefined(sequenceId) || !isUndefined(sequenceIndex)) {
            animationsRef.current[getSequenceId(sequenceIndex, sequenceId)] = data;
        }
    }, []);
    React__namespace.useEffect(() => {
        const sequencesToAnimate = Array.isArray(sequences) && sequences.length
            ? sequences
            : Object.values(animationsRef.current);
        const localAnimationState = {};
        (play ? sequencesToAnimate : [...sequencesToAnimate].reverse()).reduce((previous, { sequenceId, sequenceIndex, duration = DEFAULT_DURATION, delay, overlay, }, currentIndex) => {
            const id = getSequenceId(sequenceIndex, sequenceId, currentIndex);
            const currentTotalDuration = calculateTotalDuration({
                duration,
                delay,
                overlay,
            });
            const totalDuration = currentTotalDuration + previous;
            localAnimationState[id] = {
                play,
                pause: !play,
                delay: (delay || 0) + previous,
                controlled: true,
            };
            return totalDuration;
        }, 0);
        setAnimationStates(localAnimationState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [play]);
    return (React__namespace.createElement(AnimateContext.Provider, { value: { animationStates, register } }, children));
}

var secToMs = (ms) => (ms || 0) * 1000;

function Animate(props) {
    const { play, children, render, start, end, complete = '', onComplete, delay = 0, duration = DEFAULT_DURATION, easeType = DEFAULT_EASE_TYPE, sequenceId, sequenceIndex, } = props;
    const onCompleteTimeRef = React__namespace.useRef();
    const [style, setStyle] = React__namespace.useState(start || {});
    const { register, animationStates = {} } = React__namespace.useContext(AnimateContext);
    const id = getSequenceId(sequenceIndex, sequenceId);
    React__namespace.useEffect(() => {
        if ((!isUndefined(sequenceIndex) && sequenceIndex >= 0) || sequenceId) {
            register(props);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    React__namespace.useEffect(() => {
        const animationState = animationStates[id] || {};
        setStyle({
            ...(play || animationState.play ? end : start),
            transition: `${ALL} ${duration}s ${easeType} ${animationState.delay || delay}s`,
        });
        if (play && (complete || onComplete)) {
            onCompleteTimeRef.current = setTimeout(() => {
                complete && setStyle(complete);
                onComplete && onComplete();
            }, secToMs((animationState.delay || delay) + duration));
        }
        return () => onCompleteTimeRef.current && clearTimeout(onCompleteTimeRef.current);
    }, [
        id,
        animationStates,
        play,
        duration,
        easeType,
        delay,
        onComplete,
        start,
        end,
        complete,
    ]);
    return render ? render({ style }) : React__namespace.createElement("div", { style: style }, children);
}

var camelCaseToDash = (camelCase) => camelCase ? camelCase.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`) : '';

const generateKeyframes = (keyframes) => {
    const animationLength = keyframes.length;
    return keyframes.reduce((previous, keyframe, currentIndex) => {
        const keyframePercentage = parseFloat((100 / (animationLength - 1)).toFixed(2)) * currentIndex;
        if (typeof keyframe === 'string') {
            return `${previous} ${keyframePercentage}% {${keyframe}}`;
        }
        const keys = Object.keys(keyframe);
        if (keys.length && isNaN(+keys[0])) {
            const keyframeContent = keys.reduce((acc, key) => `${acc} ${camelCaseToDash(key)}: ${keyframe[key]};`, '');
            return `${previous} ${keyframePercentage}% {${keyframeContent}}`;
        }
        return `${previous} ${keys[0]}% {${keyframe[keys[0]]}}`;
    }, '');
};
function createStyle({ keyframes, animationName, }) {
    return `@keyframes ${animationName} {${generateKeyframes(keyframes)}}`;
}

function createTag({ keyframes, animationName, }) {
    var _a, _b, _c, _d;
    let styleTag = document.querySelector('style[data-id=rsi]');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.setAttribute('data-id', 'rsi');
        document.head.appendChild(styleTag);
    }
    const index = (_c = (_b = (_a = styleTag.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
    try {
        (_d = styleTag.sheet) === null || _d === void 0 ? void 0 : _d.insertRule(createStyle({
            keyframes,
            animationName,
        }), index);
    }
    catch (e) {
        console.error('react simple animate, error found during insert style ', e); // eslint-disable-line no-console
    }
    return {
        styleTag,
        index,
    };
}

var deleteRules = (sheet, deleteName) => {
    if (!sheet) {
        return;
    }
    const index = Object.values(sheet.cssRules).findIndex(({ name }) => name === deleteName);
    if (index >= 0) {
        sheet.deleteRule(index);
    }
};

var createRandomName = () => `RSI-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

var getPlayState = (pause) => (pause ? PAUSED : RUNNING);

function AnimateKeyframes(props) {
    const { children, play = false, pause = false, render, duration = DEFAULT_DURATION, delay = 0, easeType = DEFAULT_EASE_TYPE, direction = DEFAULT_DIRECTION, fillMode = DEFAULT_FILLMODE, iterationCount = 1, sequenceIndex, keyframes, sequenceId, } = props;
    let pauseValue;
    const animationNameRef = React__namespace.useRef({
        forward: '',
        reverse: '',
    });
    const controlled = React__namespace.useRef(false);
    const styleTagRef = React__namespace.useRef({
        forward: null,
        reverse: null,
    });
    const id = getSequenceId(sequenceIndex, sequenceId);
    const { register, animationStates = {} } = React__namespace.useContext(AnimateContext);
    const animateState = animationStates[id] || {};
    const [, forceUpdate] = React__namespace.useState(false);
    React__namespace.useEffect(() => {
        const styleTag = styleTagRef.current;
        const animationName = animationNameRef.current;
        animationNameRef.current.forward = createRandomName();
        let result = createTag({
            animationName: animationNameRef.current.forward,
            keyframes,
        });
        styleTagRef.current.forward = result.styleTag;
        animationNameRef.current.reverse = createRandomName();
        result = createTag({
            animationName: animationNameRef.current.reverse,
            keyframes: keyframes.reverse(),
        });
        styleTagRef.current.reverse = result.styleTag;
        register(props);
        if (play) {
            forceUpdate(true);
        }
        return () => {
            var _a, _b;
            deleteRules((_a = styleTag.forward) === null || _a === void 0 ? void 0 : _a.sheet, animationName.forward);
            deleteRules((_b = styleTag.reverse) === null || _b === void 0 ? void 0 : _b.sheet, animationName.reverse);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (animateState.controlled && !controlled.current) {
        pauseValue = animateState.pause;
        if (!animateState.pause) {
            controlled.current = true;
        }
    }
    else {
        pauseValue = pause;
    }
    const style = {
        animation: `${duration}s ${easeType} ${animateState.delay || delay}s ${iterationCount} ${direction} ${fillMode} ${getPlayState(pauseValue)} ${((animateState.controlled ? animateState.play : play)
            ? animationNameRef.current.forward
            : animationNameRef.current.reverse) || ''}`,
    };
    return render ? render({ style }) : React__namespace.createElement("div", { style: style || {} }, children);
}

function useAnimate(props) {
    const { start, end, complete, onComplete, delay = 0, duration = DEFAULT_DURATION, easeType = DEFAULT_EASE_TYPE, } = props;
    const transition = React__namespace.useMemo(() => `${ALL} ${duration}s ${easeType} ${delay}s`, [duration, easeType, delay]);
    const [animate, setAnimate] = React__namespace.useState({
        isPlaying: false,
        style: { ...start, transition },
    });
    const { isPlaying, style } = animate;
    const onCompleteTimeRef = React__namespace.useRef();
    React__namespace.useEffect(() => {
        if ((onComplete || complete) && isPlaying) {
            onCompleteTimeRef.current = setTimeout(() => {
                if (onComplete) {
                    onComplete();
                }
                if (complete) {
                    setAnimate((animate) => ({
                        ...animate,
                        style: complete,
                    }));
                }
            }, secToMs(delay + duration));
        }
        return () => onCompleteTimeRef.current && clearTimeout(onCompleteTimeRef.current);
    }, [animate, complete, delay, duration, isPlaying, onComplete]);
    return {
        isPlaying,
        style,
        play: React__namespace.useCallback((isPlaying) => {
            setAnimate((animate) => ({
                ...animate,
                style: {
                    ...(isPlaying ? end : start),
                    transition,
                },
                isPlaying,
            }));
        }, [end, start, transition]),
    };
}

function useAnimateKeyframes(props) {
    const { duration = DEFAULT_DURATION, delay = 0, easeType = DEFAULT_EASE_TYPE, direction = DEFAULT_DIRECTION, fillMode = DEFAULT_FILLMODE, iterationCount = 1, keyframes, } = props;
    const animationNameRef = React__namespace.useRef({
        forward: '',
        reverse: '',
    });
    const styleTagRef = React__namespace.useRef({
        forward: null,
        reverse: null,
    });
    const { register } = React__namespace.useContext(AnimateContext);
    const [isPlaying, setIsPlaying] = React__namespace.useState(null);
    const [isPaused, setIsPaused] = React__namespace.useState(false);
    React__namespace.useEffect(() => {
        const styleTag = styleTagRef.current;
        const animationName = animationNameRef.current;
        animationNameRef.current.forward = createRandomName();
        let result = createTag({
            animationName: animationNameRef.current.forward,
            keyframes,
        });
        styleTagRef.current.forward = result.styleTag;
        animationNameRef.current.reverse = createRandomName();
        result = createTag({
            animationName: animationNameRef.current.reverse,
            keyframes: keyframes.reverse(),
        });
        styleTagRef.current.reverse = result.styleTag;
        register(props);
        return () => {
            var _a, _b;
            deleteRules((_a = styleTag.forward) === null || _a === void 0 ? void 0 : _a.sheet, animationName.forward);
            deleteRules((_b = styleTag.reverse) === null || _b === void 0 ? void 0 : _b.sheet, animationName.reverse);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const style = {
        animation: `${duration}s ${easeType} ${delay}s ${iterationCount} ${direction} ${fillMode} ${getPlayState(isPaused)} ${isPlaying === null
            ? ''
            : isPlaying
                ? animationNameRef.current.forward
                : animationNameRef.current.reverse}`,
    };
    return {
        style,
        play: setIsPlaying,
        pause: setIsPaused,
        isPlaying: !!isPlaying,
    };
}

function createArrayWithNumbers(length) {
    return Array.from({ length }, () => null);
}

function useAnimateGroup(props) {
    const { sequences = [] } = props;
    const defaultArray = createArrayWithNumbers(sequences.length).map((_, index) => props.sequences[index].start);
    const [styles, setStyles] = React__namespace.useState(defaultArray);
    const [isPlaying, setPlaying] = React__namespace.useState(false);
    const animationNamesRef = React__namespace.useRef([]);
    const styleTagRef = React__namespace.useRef([]);
    React__namespace.useEffect(() => {
        sequences.forEach(({ keyframes }, i) => {
            if (!Array.isArray(keyframes)) {
                return;
            }
            if (!animationNamesRef.current[i]) {
                animationNamesRef.current[i] = {};
                styleTagRef.current[i] = {};
            }
            animationNamesRef.current[i].forward = createRandomName();
            let result = createTag({
                animationName: animationNamesRef.current[i].forward,
                keyframes,
            });
            styleTagRef.current[i].forward = result.styleTag;
            animationNamesRef.current[i].reverse = createRandomName();
            result = createTag({
                animationName: animationNamesRef.current[i].reverse,
                keyframes: keyframes.reverse(),
            });
            styleTagRef.current[i].reverse = result.styleTag;
        });
        const styleTags = styleTagRef.current;
        const animationNames = animationNamesRef.current;
        return () => Object.values(animationNames).forEach(({ forward, reverse }, i) => {
            var _a, _b;
            deleteRules((_a = styleTags[i].forward) === null || _a === void 0 ? void 0 : _a.sheet, forward);
            deleteRules((_b = styleTags[i].reverse) === null || _b === void 0 ? void 0 : _b.sheet, reverse);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const play = React__namespace.useCallback((isPlay) => {
        let totalDuration = 0;
        const animationRefWithOrder = isPlay
            ? animationNamesRef.current
            : [...animationNamesRef.current].reverse();
        const styles = (isPlay ? sequences : [...sequences].reverse()).map((current, currentIndex) => {
            const { duration = DEFAULT_DURATION, delay = 0, overlay, keyframes, iterationCount = 1, easeType = DEFAULT_EASE_TYPE, direction = DEFAULT_DIRECTION, fillMode = DEFAULT_FILLMODE, end = {}, start = {}, } = current;
            const delayDuration = currentIndex === 0 ? delay : totalDuration;
            const transition = `${ALL} ${duration}s ${easeType} ${delayDuration}s`;
            totalDuration =
                calculateTotalDuration({ duration, delay, overlay }) + totalDuration;
            return keyframes
                ? {
                    animation: `${duration}s ${easeType} ${delayDuration}s ${iterationCount} ${direction} ${fillMode} ${RUNNING} ${isPlay
                        ? animationRefWithOrder[currentIndex].forward
                        : animationRefWithOrder[currentIndex].reverse}`,
                }
                : {
                    ...(isPlay ? end : start),
                    transition,
                };
        });
        setStyles(isPlay ? styles : [...styles].reverse());
        setPlaying(isPlay);
    }, []);
    return { styles, play, isPlaying };
}

exports.Animate = Animate;
exports.AnimateGroup = AnimateGroup;
exports.AnimateKeyframes = AnimateKeyframes;
exports.useAnimate = useAnimate;
exports.useAnimateGroup = useAnimateGroup;
exports.useAnimateKeyframes = useAnimateKeyframes;
