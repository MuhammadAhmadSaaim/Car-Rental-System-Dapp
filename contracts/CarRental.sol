// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <=0.8.21;

contract CarRental {
    struct Car {
        uint256 carId; // Updated: Added carId field
        string name;
        address owner;
        bool available;
        address renter;
    }

    mapping(uint256 => Car) public cars;
    uint256 public totalCars = 0; // Updated: Initialize totalCars to 0

    event CarAdded(uint256 carId, string name, address owner);
    event CarRented(uint256 carId, address renter);
    event CarReturned(uint256 carId);

    // Function to add a new car
    function addCar(string calldata _name) external {
        uint256 carId = totalCars++;
        cars[carId] = Car(
            carId,
            _name,
            msg.sender,
            true,
            address(0x0000000000000000000000000000000000000000)
        );
        emit CarAdded(carId, _name, msg.sender);
    }

    // Function to rent a car
    function rentCar(uint256 _carId) external {
        require(cars[_carId].available, "Car is not available");
        cars[_carId].available = false;
        cars[_carId].renter = msg.sender;
        emit CarRented(_carId, msg.sender);
    }

    // Function to return a rented car
    function returnCar(uint256 _carId) external {
        require(
            cars[_carId].renter == msg.sender,
            "You are not the renter of this car"
        );
        cars[_carId].available = true;
        cars[_carId].renter = address(0);
        emit CarReturned(_carId);
    }
}
