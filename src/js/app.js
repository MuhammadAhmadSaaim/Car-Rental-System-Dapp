App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  listenForAccountChange: function () {
    // Listen for account change
    window.ethereum.on('accountsChanged', function (accounts) {
      // Reload the page when the account changes
      window.location.reload();
    });
  },

  init: function () {
    App.listenForAccountChange();
    return App.initWeb3();
  },


  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("CarRental.json", function (carRental) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.CarRental = TruffleContract(carRental);
      // Connect provider to interact with contract
      App.contracts.CarRental.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.CarRental.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
    });
  },

  render: function () {
    var carRentalInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.CarRental.deployed().then(function (instance) {
      carRentalInstance = instance;
      return carRentalInstance.totalCars();
    }).then(function (totalCars) {
      var carList = $("#carlist");
      carList.empty();

      for (var i = 0; i < totalCars; i++) {
        (function (i) { // Create closure to capture 'i' correctly
          carRentalInstance.cars(i).then(function (car) {
            var carId = car[0];
            var carName = car[1];
            var owner = car[2];
            var available = car[3];
            var renter = car[4];

            // Render car information
            var carTemplate = "<div class='col-sm-4'>";
            carTemplate += "<b>Name:</b> " + carName + "<br>";
            carTemplate += "<b>Owner:</b> " + owner + "<br>";
            carTemplate += "<b>Status:</b> ";
            if (available) {
              carTemplate += "Available<br>";
              // Disable rent button if the current account is the owner
              if (owner === App.account) {
                carTemplate += "<button disabled>Rent</button>";
              } else {
                carTemplate += "<button onclick='App.rentCar(" + carId + ")'>Rent</button>";
              }
            } else {
              carTemplate += "Rented by " + renter + "<br>";
              if (renter === App.account) { // Enable return button only for the renter
                carTemplate += "<button onclick='App.returnCar(" + carId + ")'>Return</button>";
              } else {
                carTemplate += "<button disabled>Return</button>";
              }
            }
            carTemplate += "</div>";

            carList.append(carTemplate);
          });
        })(i);
      }

      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  addCar: function () {
    var carName = prompt("Enter car name:");
    if (carName !== null && carName !== "") {
      console.log("Car name entered by user:", carName); // Debugging
      App.contracts.CarRental.deployed().then(function (instance) {
        return instance.addCar(carName, { from: App.account });
      }).then(function (result) {
        // Reload page when a new car is added
        window.location.reload();
      }).catch(function (err) {
        console.error(err);
      });
    }
  },


  rentCar: function (carId) {
    App.contracts.CarRental.deployed().then(function (instance) {
      return instance.rentCar(carId, { from: App.account });
    }).then(function (result) {
      // Reload page when a car is rented
      window.location.reload();
    }).catch(function (err) {
      console.error(err);
    });
  },

  returnCar: function (carId) {
    App.contracts.CarRental.deployed().then(function (instance) {
      return instance.returnCar(carId, { from: App.account });
    }).then(function (result) {
      // Reload page when a car is returned
      window.location.reload();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
    $("#addCarBtn").click(App.addCar); // Add event listener to the "Add Car" button
  });
});
