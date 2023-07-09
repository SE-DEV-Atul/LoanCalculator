import React,
{
  useState,
  useEffect
} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  View,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  StatusBar
} from 'react-native';

import {
  Skia,
  Canvas,
  Path,
  Line,
  vec,
  useComputedValue,
  useValue,
  useTouchHandler,
  LinearGradient as SKLinearGradient,
  Text,
  useFont,
  Circle,
} from '@shopify/react-native-skia';
import LinearGradient from 'react-native-linear-gradient';

const dimens = Dimensions.get('screen');
const topViewHeight = dimens.height - ((dimens.height * 92.9) / 100);
const verticalShiftConst = topViewHeight;
const height = dimens.height - ((dimens.height * 22) / 100); 
const rulerCount = Array.from(Array(61).keys()); // create array of number from 0-61 to draw ruler
const labelArray = Array.from({ length: 11 }, (_, i) => i);  // create array of number from 0-10 to print label

export const WaveMeter = () => {
  const selectedValue = useValue(0);
  const verticalShift = useValue(verticalShiftConst);
  const circlePosition = useValue(Number.POSITIVE_INFINITY);
  const font = useFont(require('./fonts/OpenSans-Regular.ttf'), 20);
  const secondFont = useFont(require('./fonts/OpenSans-Bold.ttf'), 28);
  const [loanTenure, setLoanTenure] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanInterest, setLoanInterest] = useState(0);
  const [interestRate, setInterestRate] = useState(18);

  useEffect(() => {
    setLoanTenure(6)
    calculatePercent();
  }, [loanAmount]);

  const touchHandler = useTouchHandler({    // for getting gesture value
    onActive: ({ y }) => {
      if (y > verticalShiftConst) { 
        circlePosition.current = y;
        verticalShift.current = Math.min(height, y);
      }
    },
  });

  const valueBetween = (value, min, max) => {    // for get minimum and maximum value on screoll with circle position
    let result = 0;
    if (value >= min && value <= max) {
      result = value;
    }
    else if (value < min) {
      result = min;
    }
    else if (value > max) {
      result = max;
    }
    return result;
  }

  const calculatePercent = () => {       // for calculating the interest amount 
    let interestAmt = (loanAmount / 100) * interestRate;
    setLoanInterest(interestAmt);
  };

  const linePath = useComputedValue(() => {   // for drwaing path with moving curv
    const curvPoint = valueBetween(circlePosition.current, height * 0.1, height * 0.9)
    selectedValue.current = Math.floor((100 - (100 * (curvPoint - (height * 0.1))) / (height * 0.8)) + 10) * 1000;
    const path = Skia.Path.Make();
    path.moveTo(dimens.width * 0.36, 0);
    path.lineTo(dimens.width * 0.36, curvPoint - 60);
    path.quadTo(dimens.width * 0.36, curvPoint - 35, dimens.width * 0.33, curvPoint - 20);
    path.quadTo(dimens.width * 0.29, curvPoint, dimens.width * 0.33, curvPoint + 20);
    path.quadTo(dimens.width * 0.36, curvPoint + 35, dimens.width * 0.36, curvPoint + 70);
    path.lineTo(dimens.width * 0.36, height);
    setLoanAmount(selectedValue.current);
    return path;
  }, [verticalShift]);

  const circlePath = useComputedValue(() => {  // for calculating cy position to move a circle
    let verticalDrag = Math.floor(verticalShift.current);
    let YPosCircle = 555;
    if (verticalDrag >= 55 && verticalDrag <= 559) {
      YPosCircle = verticalShift.current;
    }
    return YPosCircle;
  }, [verticalShift]);

  const gradientStart = useComputedValue(() => {   // for path line gradient start
    return vec(0, verticalShift.current);
  }, [verticalShift]);

  const gradientEnd = useComputedValue(() => {     // for path line gradient end
    return vec(0, verticalShift.current + 150);
  }, [verticalShift]);

  const getLabelXValueOffset = (position) => {    // for label x position
    let labelXPosition = 30;
    if (position < 2) {
      labelXPosition = 20;
    }
    return labelXPosition;
  };

  const getLabelYValueOffset = (position) => {  // for label y position
    return verticalShiftConst + 50 * position;
  };

  const getYLabelValue = (position) => {  // to get the label value to show
    return `${110 - position * 10}k`;
  };

  const getLineXValueOffset = (position) => {    // for the x position of ruler line
    let LineXOffset = vec(position % 6 == 0 ? dimens.width * 0.24 : dimens.width * 0.27, (verticalShiftConst - 10) + 8.5 * position);
    return LineXOffset;
  };

  const getLineYValueOffset = (position) => {   // for the y position of ruler line
    let LineYOffset = vec(dimens.width * 0.32, (verticalShiftConst - 10) + 8.5 * position);
    return LineYOffset;
  };

  const alertValue = () => {
    Alert.alert('VALUE', `Your Loan Amount is: ${loanAmount} \n Your interest Amount is: ${loanInterest} `);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#61dafb"
        barStyle="light-content"
      />
      <View style={styles.loanView}>
        <RNText style={styles.titleText}>{"Term Loan"}</RNText>
      </View>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Path
          path={linePath}
          color="lightblue"
          style="stroke"
          strokeJoin="round"
          strokeWidth={5}
        ><SKLinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={['#EF6A40', '#E95D85', '#DD4ED7']}
          />
        </Path>
        {rulerCount.map(val => {
          return (
            <Line
              key={val.toString()}
              p1={getLineXValueOffset(val)}
              p2={getLineYValueOffset(val)}
              color={val % 6 == 0 ? '#ffffff' : '#909090'}
              style="stroke"
              strokeWidth={0.8}
            />
          )
        })}
        {labelArray.map(val => {
          return (
            <Text
              key={val.toString()}
              x={getLabelXValueOffset(val)}
              y={getLabelYValueOffset(val)}
              text={getYLabelValue(val)}
              font={font}
              color={'white'}
            />
          );
        })}
        <Circle cx={145} cy={circlePath} r={18} color="white" />
        <Text
          x={200}
          y={100}
          text="Loan Tenure"
          font={font}
          color={'#ffffff'}
        />
        <Text
          x={200}
          y={135}
          text={`${loanTenure} Months`}
          font={secondFont}
          color={'#ffffff'}
        />
        <Text
          x={200}
          y={220}
          text="Loan Amount"
          font={font}
          color={'#ffffff'}
        />
        <Text
          x={200}
          y={255}
          text={`${loanAmount}`}
          font={secondFont}
          color={'#6DA065'}
        />
        <Text
          x={200}
          y={320}
          text={`EMI @${interestRate}% p.a`}
          font={font}
          color={'#ffffff'}
        />
        <Text
          x={200}
          y={355}
          text={`${loanInterest}`}
          font={secondFont}
          color={'#ffffff'}
        />
        <Text
          x={200}
          y={440}
          text="Lorem Ipsum"
          font={font}
          color={'#ffffff'}
        />
      </Canvas>
      <View style={styles.btnView}>
        <LinearGradient colors={['#EF6A40', '#E95D85', '#DD4ED7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.linearGradient}>
          <TouchableOpacity style={styles.buttonContainer} onPress={alertValue}>
            <RNText style={styles.buttonText}>Apply Now</RNText>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loanView: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  canvas: {
    flex: 80,
  },
  btnView: {
    flex: 14,
    justifyContent: 'center',
  },
  linearGradient: {
    height: 60,
    borderRadius: 100,
    marginHorizontal: 20,
  },
  buttonContainer: {
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default WaveMeter;
