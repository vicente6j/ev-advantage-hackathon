import React, { useEffect, useState } from 'react';
import styles from "./LineGraph.module.scss";
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory';
import kwh from '../Data/VehicleKwhMile';
import milespergallon from '../Data/VehicleGallonMile';
import kwhRates from "../Data/KwhRatesState";
import fuelRates from "../Data/FuelRatesState";
import ytd from "../Data/FakeDataYtd";
import infoicon from "../infoicon.png";
import { Link } from 'react-scroll';

const TimeFrame = {
    Day: 0,
    Week: 1,
    Month: 2,
    Year: 3,
    YTD: 4,
};

const getTimeFrameLabel = (timeFrame) => {
    switch (timeFrame) {
        case 0:
            return "Day";
        case 1:
            return "Week";
        case 2:
            return "Month";
        case 3:
            return "Year";
        case 4:
            return "YTD";
        default:
            return "Unknown";
    }
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", 
              "Jun", "Jul", "Aug", "Sep", "Oct", 
              "Nov", "Dec"];

const weekdays = ["Sun", "Mon", "Tues", 
              "Wed", "Thur", "Fri", "Sat"];

const LineGraph = ({
    milageData,
    timeFrame,
    usState,
    vehicle
}) => {

    const [myPowerConsumption, setMyPowerConsumption] = useState(0);
    const [mySavings, setMySavings] = useState(0);

    const [consumptionState, setConsumptionState] = useState(0);
    const [savingsState, setSavingsState] = useState(0);

    const [currVehicle, setCurrVehicle] = useState(null);
    const [currTimeFrame, setCurrTimeFrame] = useState(null);
    const [currLocation, setCurrLocation] = useState(null);
    const [prevVehicle, setPrevVehicle] = useState(null);
    const [prevTimeFrame, setPrevTimeFrame] = useState(null);
    const [prevLocation, setPrevLocation] = useState(null);
  
    // lifetime total miles
    let totalMilesLifetime = 0;
    let counter = 0;
    for (let month = 0; month < 4; month++) {
        for (let day = 1; day <= 31; day++) {

            totalMilesLifetime += ytd[counter].miles_driven;
            if ((month === 3 || month === 5 || month === 8 || month === 10) 
                && day === 30) {
                day++;
            }
            if (month === 2 && day === 28) {
                day+=3;
            }
            counter++;
        }
    }

  let kwhRate = kwhRates.find(item => item.Name === usState).avgRetailPrice / 100;
  let gallonRate = fuelRates.find(item => item.state === usState).average_fuel_price;
  let milePerKwh = kwh.find(item => item.vehicle === vehicle).mile_per_kwh;

  let totalMiles = 0;
  let data = [];

    if (timeFrame === TimeFrame.YTD) {
        let miles = 0;
        let count = 0;

        for (let month = 0; month < 4; month++) {
            for (let day = 1; day <= 31; day++) {

                miles += milageData[count].miles_driven;
                totalMiles += milageData[count].miles_driven;

                if ((month === 3 || month === 5 || month === 8 || month === 10) 
                        && day === 30) {
                    day++;
                }
                if (month === 2 && day === 28) {
                    day += 3;
                }
                count++;
            }
            data.push({x: months[month], y: totalMiles});
            miles = 0;
        }
    } else if (timeFrame === TimeFrame.Year) {
        for (let month = 0; month < 12; month++) {
            totalMiles += milageData[month].miles_driven;
            data.push({x: months[month], y: milageData[month].miles_driven});
        }
    } else if (timeFrame === TimeFrame.Month) {
        for (let day = 0; day < 31; day++) {
            totalMiles += milageData[day].miles_driven;
            data.push({x: day, y: milageData[day].miles_driven});
        }
    } else if (timeFrame === TimeFrame.Week) {
        for (let day = 0; day < 7; day++) {
            totalMiles += milageData[day].miles_driven;
            data.push({x: weekdays[day], y: milageData[day].miles_driven});
        }
    } else if (timeFrame === TimeFrame.Day) {
        for (let hour = 1; hour <= 24; hour++) {
            totalMiles += milageData[hour].miles_driven / 24;
            data.push({x: hour, y: milageData[hour].miles_driven / 24});
        }
    }

    // timeframe calculations
    let kwhConsumption = totalMiles / milePerKwh;

    let evExpenses = kwhRate * kwhConsumption;
    let estGallonConsumption = totalMiles / milespergallon[4].mpg;
    let iceExpenses = estGallonConsumption * gallonRate;

    let estSavings = iceExpenses - evExpenses;
    let co2 = totalMiles * .404;

    useEffect(() => {
        const handleNewKwConsumption = (kwhConsumption) => {
            if (kwhConsumption < myPowerConsumption) {
                setConsumptionState(0);
            } else if (kwhConsumption === myPowerConsumption) {
                setConsumptionState(1);
            } else {
                setConsumptionState(2);
            }
            setMyPowerConsumption(kwhConsumption);
        };

        const handleNewSavings = (savings) => {
            if (savings < mySavings) {
                setSavingsState(0);
            } else if (savings === mySavings) {
                setSavingsState(1);
            } else {
                setSavingsState(2);
            }
            setMySavings(savings);
        }

        const handleNewData = (vehicle, timeFrame, location) => {
            setPrevLocation(currLocation);
            setPrevTimeFrame(currTimeFrame);
            setPrevVehicle(currVehicle);
            setCurrLocation(location);
            setCurrTimeFrame(timeFrame);
            setCurrVehicle(vehicle);
        }

        handleNewKwConsumption(kwhConsumption);
        handleNewSavings(estSavings);
        handleNewData(vehicle, timeFrame, usState);

    }, [kwhConsumption, estSavings, vehicle, timeFrame, usState]);

    // lifetime
    let kwhLifetime = totalMilesLifetime / milePerKwh;
    let evExpensesLifetime = kwhRate * kwhLifetime;

    let gallonLifetime = totalMilesLifetime / milespergallon[4].mpg;
    let iceExpensesLifetime = gallonLifetime * gallonRate;

    let estSavingsLifetime = iceExpensesLifetime - evExpensesLifetime;
    let co2Lifetime = totalMilesLifetime * .404/1000;

    return (
        <div id={styles.Container}>
            <div id={styles.LineGraph}>
                <div key={`${timeFrame}`} className={styles.Graph}>
                    <h2 className={styles.Major}>
                        Miles Driven by <span className={styles.TimeFrame}>{getTimeFrameLabel(timeFrame) + " "}</span>
                        in your <span className={styles.TimeFrame}>{vehicle}</span>
                    </h2>
                    <VictoryChart theme={VictoryTheme.material} minDomain={{ y: 0 }}>
                        <VictoryLine data={data} x="x" y="y" />
                        <VictoryAxis />
                        <VictoryAxis dependentAxis />
                    </VictoryChart>
                </div>

                <div className={styles.Stats} key={`${currTimeFrame} ${currLocation} ${currVehicle}`}>
                    <h2>Summary for 
                        <span className={styles.TimeFrame}>{" " + getTimeFrameLabel(timeFrame) + " "}</span> 
                        in <span className={styles.Location}>{usState}</span>
                    </h2>
                    <h3 className={styles.Relative}>
                        *Relative to {prevLocation}, {prevVehicle}, {getTimeFrameLabel(prevTimeFrame)}
                        </h3>
                    <table>
                        <tr>
                            <td>Power consumption</td>
                            <td>{kwhConsumption.toFixed(2)} kWh</td>
                            
                            <Link to={styles.Calculations} smooth={true} offset={-50} duration={0}>
                            <img className={styles.InfoTable} src={infoicon} alt="info"/>
                            </Link>
                            {consumptionState === 0 && (
                            <div className={styles.ArrowDown}></div>
                            )}
                            {consumptionState === 1 && (
                            <div className={styles.Neutral}></div>
                            )}
                            {consumptionState === 2 && (
                            <div className={styles.ArrowUp}></div>
                            )}
                        </tr>
                        <tr>
                            <td>Distance driven</td>
                            <td>{totalMiles.toFixed(2)} mi</td>
                        </tr>
                        <tr>
                            <td>Est. savings</td>
                            <td>${estSavings.toFixed(2)}</td>

                            <Link to={styles.Calculations} smooth={true} offset={-50} duration={0}>
                            <img className={styles.InfoTable} src={infoicon} alt="info"/>
                            </Link>
                            {savingsState === 0 && (
                            <div className={styles.ArrowDown}></div>
                            )}
                            {savingsState === 1 && (
                            <div className={styles.Neutral}></div>
                            )}
                            {savingsState === 2 && (
                            <div className={styles.ArrowUp}></div>
                            )}
                        </tr>
                        <tr>
                            <td>Est. CO2 reduction</td>
                            <td>{co2.toFixed(2)} kg</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div id={styles.Calculations}>
                <h3 className={styles.Minor}>
                How do we calculate power consumption?
                <Link to={styles.Calculations} smooth={true} offset={-50} duration={0}>
                    <img className={styles.InfoCalculations} src={infoicon} alt="info"/>
                </Link>
                </h3>
                <p>
                Given that you are driving a <span className={styles.Location}>{vehicle}</span>  , we source its
                mile/kwH and km/kwH to compute a rough power expenditure for the last 
                <span className={styles.Location}>{" " + getTimeFrameLabel(timeFrame)}</span>.
                </p>
                <h3 className={styles.Minor}>
                How do we calculate estimated savings?
                <Link to={styles.Calculations} smooth={true} offset={-50} duration={0}>
                    <img className={styles.InfoCalculations} src={infoicon} alt="info"/>
                </Link>
                </h3>
                <p>
                Given that you are in <span className={styles.Location}>{currLocation}</span>, we source its
                location kwH rates and miles/gallon rates to compute the relevant financial spread. Then, we apply
                the number of miles you drove in the <span className={styles.Location}>{getTimeFrameLabel(timeFrame) + " "}</span>
                as well as the <span className={styles.Location}>Power Consumption</span> we calculated earlier to obtain the savings.
                </p>
            </div>
        </div>
    );
};

export default LineGraph;
