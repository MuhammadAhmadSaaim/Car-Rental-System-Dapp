var CarRental = artifacts.require("CarRental");

contract("CarRental", (accounts) => {
    let carRentalInstance;

    before(async () => {
        carRentalInstance = await CarRental.deployed();
    });

    it("should add a new car", async () => {
        const carName = "Test Car";
        const owner = accounts[0];

        const result = await carRentalInstance.addCar(carName, { from: owner });
        const carAddedEvent = result.logs[0];
        assert.equal(carAddedEvent.event, "CarAdded", "CarAdded event should be emitted");
    });

    it("should rent a car", async () => {
        const carId = 0;
        const renter = accounts[1];

        await carRentalInstance.rentCar(carId, { from: renter });
        const car = await carRentalInstance.cars(carId);

        assert.equal(car.renter, renter, "Car should be rented by the specified renter");
        assert.equal(car.available, false, "Car should not be available after renting");
    });

    it("should return a rented car", async () => {
        const carId = 0;
        const renter = accounts[1];

        await carRentalInstance.returnCar(carId, { from: renter });
        const car = await carRentalInstance.cars(carId);

        assert.equal(car.renter, "0x0000000000000000000000000000000000000000", "Car should not have a renter after return");
        assert.equal(car.available, true, "Car should be available after return");
    });
});
