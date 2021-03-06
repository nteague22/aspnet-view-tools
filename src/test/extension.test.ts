//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import {ExtensionContext} from 'vscode';
import * as aspnetViews from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {
    // Defines a Mocha unit test
    test("Path resides in local directory", () => {
      aspnetViews.activate(null);
    });
});