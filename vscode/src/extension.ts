// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as abcjs from 'abcjs';
import { JSDOM } from 'jsdom';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "drum-chart" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('drum-chart.chartme', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const panel = vscode.window.createWebviewPanel(
				'webview', // Identifies the type of the webview. Used internally
				'drum chart preview', // Title of the panel displayed to the user
				vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
				{
					enableScripts: true,
				} // Webview options. More on these later.
			);

			const scriptUri = panel.webview.asWebviewUri(
				vscode.Uri.file(path.join(context.extensionPath, 'dist', 'abcjs-basic-min.js'))
			  );

			const header = `X:1\\nK:C clef=perc\\n`;
			// Set the webview's HTML content
			var abc = header + `M:4/4\\ne[Fe]!open!ee|e[Fe]ee|e[FAe]ee||` + `\\n`; // `X:1\\nK:D\\nDD AA|BBA2|\\n`
			console.log("calling getWV2");
			panel.webview.html = getWebviewContent(scriptUri.toString(), abc); // editor.document.getText()
			// abcjs.renderAbc("paper", "X:1\nK:D\nDD AA|BBA2|\n");
		}
		// vscode.window.showInformationMessage('Hello World from drum-chart!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function getWebviewContent2(uri: string, content: string): string {
	const text = `<!DOCTYPE html><body><DIV id='abc'></DIV></body>`;

	try {
		const dom1 = new JSDOM(`<!DOCTYPE html><p id='abc'>Hello world</p>`);
		console.log("DOM1 " + dom1.window.document.querySelector("p").textContent); // "Hello world"

		var dom2 = new JSDOM(`<!DOCTYPE html>Hi There<DIV id='abc'>Hello world</DIV>`,{ pretendToBeVisual: true });
		console.log("After JSDOM " + dom2.window.document.querySelector("div").textContent); // not sure why this is empty - something to work on tomorrow

		// global.document = dom2.window.document;
		// global.navigator = dom2.window.navigator;
		
		var el = dom2.window.document.getElementById("abc") as HTMLElement;
		console.log("EL is " + el.id);
		if (el) {
			console.log(`starting rendering ${content}`);
			console.log(`EL Type ${typeof(el)}`);
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


function getWebviewContent(uri: string, content: string): string {
	console.log(`URI: ${uri}`);
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webview</title>
</head>

<body>
    <pre>${content}</pre>
	<div id="paper">Existing content</div>
	<script src="${uri}"></script>
	<script>
		ABCJS.renderAbc("paper", "${content}", { minSpacing: 5, maxSpacing: 5} );
	</script>
</body>
</html>`;
}

// okay - the content below is about transforming this from string to loading files - this is all to-do

/**
 * Generate the Preview HTML.
 * @param {String} editorContent
 */
async function getHtml(context: vscode.ExtensionContext, fileName: string) {
	// const editorContent = getCurrentEditorContent();

	const filePath = path.join(context.extensionPath, 'res', 'view.html');
	//const filePath = panel.webview.asWebviewUri(onDiskPath);
	let html = await loadFileContent(filePath);
	return html;
}

// load the file content
async function loadFileContent(filePath: string): Promise<string> {
	const onDiskPath = vscode.Uri.file(filePath);

	const fileContent = await vscode.workspace.fs.readFile(onDiskPath);

	let readableContent = fileContent.toString();
	return readableContent;
}

module.exports = {
	activate
};