var expect = require('../expect');
var config = require('../../../config.test.json');
var utils = require('../utils');

describe('Frontpage', function() {
  var ptor;
  var label = 'testdevice';
  var indexUrl = 'http://' + config.host + ':' + config.port + '/';

  beforeEach(function() {
    ptor = protractor.getInstance();

    // PhantomJS crashing randomly if this was not set
    browser.ignoreSynchronization = true;

    browser.get(indexUrl);
    browser.executeScript('localStorage.clear();');
    browser.get(indexUrl);
  });

  afterEach(function() {
    utils.clearAfterEach();
    browser.executeScript('localStorage.clear();');
  });

  it('should show two buttons to select the mode', function() {
    expect(element(by.id('container')).getText()).to.eventually.have.length.above(0);
    expect(element(by.css('.button-device')).getText()).to.eventually.contain('USE AS TEST DEVICE');
    expect(element(by.css('.button-control-panel')).getText()).to.eventually.contain('CONTROL DEVICE WALL');
    expect(ptor.getCurrentUrl()).to.eventually.contain('/#!/');
  });

  it('should show device mode if device button clicked', function() {
    element(by.css('.button-device')).click();
    expect(ptor.getCurrentUrl()).to.eventually.contain('/client/#!/');
  });

  it('should show control panel mode if control panel button clicked', function() {
    element(by.css('.button-control-panel')).click();
    expect(ptor.getCurrentUrl()).to.eventually.contain('/#!/devices');
  });

  it('should show device mode if device label in localStorage', function() {
    utils.writeSingleTestDevice(label);
    browser.executeScript('localStorage.setItem("label", "' + label + '");');
    browser.get(indexUrl);
    expect(ptor.getCurrentUrl()).to.eventually.contain('/client/#!/');
  });
});