import styles from "./Home.module.scss";
import React, { useState } from "react";
import LineGraph from "../../Components/LineGraph";


import FakeDataYtd from "../../Data/FakeDataYtd";
import FakeDataYear from "../../Data/FakeDataYear";


// location && vehicle data
import fuelRates from "../../Data/FuelRatesState";
import vehicleRates from "../../Data/VehicleKwhMile";


const Home = () => {


    const [location, setLocation] = useState("Arizona");
    const [vehicle, setVehicle] = useState("Chevrolet Equinox EV");
    const [state, setState] = useState(0);


    const handleChangeTimeFrame = (timeFrame) => {
        setState(timeFrame);
    }


    const handleChangeLocation = (event) => {
        setLocation(event.target.value);
    }


    const handleChangeVehicle = (event) => {
        setVehicle(event.target.value);
    }


    const milageData = state === 3 ? FakeDataYear : FakeDataYtd;


    return (
        <div id={styles.Home}>
            <div id={styles.CenterPanel}>
                <div className={styles.Header}>
                    <h2 className={styles.Major}>
                        The GM EV <span className={styles.Advantage}>Advantage</span>
                    </h2>
                    <h2 className={styles.Minor}>
                        Made by the 
                        <span className={styles.BoaConstructors}> Boa Constructors</span>
                    </h2>
                    <h3 className={styles.VehicleName}>My vehicle: {vehicle}</h3>
                    <h3 className={styles.Location}>My location: {location}</h3>
                </div>
                <div className={styles.Graphs}>
                    <h3 className={styles.Select}>*Select your vehicle</h3>
                    <select id={styles.StateSelect} value={vehicle} onChange={handleChangeVehicle}>
                        {vehicleRates.map((vehicleRate, index) => (
                            <option key={index} value={vehicleRate.vehicle}>
                                {vehicleRate.vehicle}
                            </option>
                        ))}
                    </select>


                    <h3 className={styles.Select}>*Select your state</h3>
                    <select id={styles.StateSelect} value={location} onChange={handleChangeLocation}>
                        {fuelRates.map((fuelRate, index) => (
                            <option key={index} value={fuelRate.state}>
                                {fuelRate.state}
                            </option>
                        ))}
                    </select>


                    <h3 className={styles.Select}>*Select timeframe</h3>
                    <div className={styles.Selections}>
                        <button 
                            onClick={() => handleChangeTimeFrame(0)} 
                            className={styles.Button}>
                                Day
                        </button>
                        <button 
                            onClick={() => handleChangeTimeFrame(1)} 
                            className={styles.Button}>
                                Week
                        </button>
                        <button 
                            onClick={() => handleChangeTimeFrame(2)} 
                            className={styles.Button}>
                                Month
                        </button>
                        <button 
                            onClick={() => handleChangeTimeFrame(3)} 
                            className={styles.Button}>
                                Year
                        </button>
                        <button 
                            onClick={() => handleChangeTimeFrame(4)} 
                            className={styles.Button}>
                                YTD
                        </button>
                    </div>




                    <LineGraph milageData={milageData} timeFrame={state} usState={location} vehicle={vehicle}/>
                </div>
            </div>
        </div>
    )
}


export default Home;