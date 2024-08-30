import * as abcjs from 'abcjs';
import { JSDOM } from 'jsdom';

function getWebviewContent2(uri: string, content: string): string {
	const text = `<!DOCTYPE html><body><DIV id='abc'></DIV></body>`;

	try {
		const dom1 = new JSDOM(`<!DOCTYPE html><p id='abc'>Hello world</p>`);
		console.log("DOM1 " + dom1.window.document.querySelector("p").textContent); // "Hello world"

		var dom2 = new JSDOM(`<!DOCTYPE html>Hi There<DIV id='abc'>Hello world</DIV>`, { pretendToBeVisual: true });
		console.log("After JSDOM " + dom2.window.document.querySelector("div").textContent); // not sure why this is empty - something to work on tomorrow

		// global.document = dom2.window.document;
		// global.navigator = dom2.window.navigator;

		var el = dom2.window.document.getElementById("abc") as HTMLElement;
		console.log("EL is " + el.id);
		if (el) {
			console.log(`starting rendering ${content}`);
			console.log(`EL Type ${typeof (el)}`);
			abcjs.renderAbc(el, content);
			console.log(`Done rendering ${content}`);
		}
		else {
			console.log("No EL");
		}
		console.log(`Serializing now`);
		console.log(dom2.window.document.body.innerHTML); // not sure why this is empty - something to work on tomorrow
		return dom2.serialize();
	}
	catch (error) {
		console.log("Error: " + error + " " + new Error().stack);
	}
	return "";
}



*/