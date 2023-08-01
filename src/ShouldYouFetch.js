
module.exports = class ShouldYouFetch{
	
	createHeader(user_name, password){
		return {
			'Accept' : 'application/json',
			"Content-Type":'application/x-www-form-urlencoded',
			'Authorization' : 'Basic ' + Buffer.from(`${user_name}:${password}`).toString('base64')
		};
	}

	makeErrorJSON(response, message){
		var error = {
			"status_code": response.status,
			"status_text": response.statusText,
			"description": message
		}
		return error;
	}

	/**
	 * This method will use the built in Fetch method
	 * from node.js ... this is provided for easy mocking
	 * for unit testing
	 */
	async fetch(url, header, data){
		var response = await fetch(url,{
			"method": 'POST',
			"host" : "localhost",
			"cache": "no-cache",
			"headers":header,
			'body' : data
		});
		return response;
	}

	

	async getData(user_name, password, parameters){
		var response = this.fetch(parameters.url, this.createHeader(user_name, password), parameters.data);
		var response_text = await response.text();
		if(response.status == "200"){
			return JSON.parse(response_text);
		}
		else{
			return makeErrorJSON(response, response_text);
		}
	}
}
const {describe, expect, test} = require ('@jest/globals');
const ShouldYouFetch = require('../src/ShouldYouFetch.js');

describe('ShouldYouFetch.js', ()=>{
	test("createHeader", ()=>{
		var user_name = "some name";
		var password = "some passowrd";
		var header = new ShouldYouFetch().createHeader(user_name, password);

		var expected = {
			'Authorization' : 'Basic ' + Buffer.from(`${user_name}:${password}`).toString('base64'),
			'Accept' : 'application/json',
			"Content-Type":'application/x-www-form-urlencoded'
		};

		expect(header).toMatchObject(expected)
	})
	test("makeErrorJSON", ()=>{
		var response = {status:200, statusText:'Some status text'};
		var error_message = "This is my error message";
		var expected = {
			"status_code": response.status,
			"status_text": response.statusText,
			"description": error_message
		}

		expect(new ShouldYouFetch().makeErrorJSON(response, error_message)).toMatchObject(expected)
	})
	test("getData No error", ()=>{
		class MockResponse{
			mText;
			status;
			statusText;
			async text(){
				return this.mText;
			}
			get status(){
				return this.status;
			}
			get statusText(){
				return this.statusText;
			}
		}

		//This is the instace of our class
		var shouldYouFetch = new ShouldYouFetch();

		//Only need to test a few things
		//1 are the parameters provided correction (headers)
		//2 is the data provided correctly?
		//3 what happens on success
		//4 what happens on failure?
		var parameters = {
			url:"some url",
			header:new ShouldYouFetch().createHeader("fake user", "password"),
			data:{"some":"data"}
		}
		//Here is where we inject the new method for testing
		shouldYouFetch.fetch = function(url, header, data){
			expect(url).toBe(parameters.url);
			expect(header).toMatchObject(parameters.header);
			expect(data).toMatchObject(parameters.data);
			
			var response = new MockResponse();
			response.status = 200;
			response.statusText = "OK";
			response.mText = JSON.stringify({ "any":"valid_json"});
			
			return response;
		};
		
		var result = shouldYouFetch.getData("fake user", "password", parameters);
		//Viewer TODO: Test the actual result ... is this correct?

	}),
	test("getData With error", ()=>{
		//Viewer TODO: Write tests to check the errors from Get data
		//What should the errors be? 
		//Which errors should be checked as part of the Unit and Which errors
		//should be thrown?
		//Hint: What happens if the URL is bad?
		//Hint: What status code should be returned for a bad user name?

	})
});
