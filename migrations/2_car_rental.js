var CarRental = artifacts.require("./CarRental.sol");

module.exports = function (deployer) {
    deployer.deploy(CarRental);
};