// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "drum-chart" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('drum-chart.chartme', () =>
	{
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const editor = vscode.window.activeTextEditor;
		if (editor)
		{
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
			const table = testTH();
			panel.webview.html = getWebviewContent(scriptUri.toString(), abc, table); // editor.document.getText()
			// abcjs.renderAbc("paper", "X:1\nK:D\nDD AA|BBA2|\n");
		}
		// vscode.window.showInformationMessage('Hello World from drum-chart!');
	});

	context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
export function deactivate() { }

// Convert the drum chart to HTML

function testTH(): string
{

	// Example usage:
	const text = `
Name:N
Age:A
City:C

N:John
A:30
C:New York

N:Jane
A:25
C:Los Angeles

N:Bob
C:Seattle

A:30
C:Denver

`;

	const table = textToHtmlTable(text);
	console.log(table);
	return table;
}

function textToHtmlTable(text: string): string
{
	type KVP = { [key: string]: string };
	const lines = text.trim().split('\n');
	let rows: KVP = {};
	let column: KVP = {}; // this will hold a single column
	let columns: KVP[] = [];


	let isRowDefinition = true;

	for (const line of lines)
	{
		if (line.trim() === '')
		{
			if (isRowDefinition)
			{
				isRowDefinition = false;
			}
			else
			{
				columns.push(column);
				column = {};
			}
		} else if (isRowDefinition)
		{
			const [name, abbreviation] = line.split(':').map(s => s.trim());
			rows[abbreviation] = name;
		} else
		{
			const [abbreviation, value] = line.split(':').map(s => s.trim());
			column[abbreviation] = value;
		}
	}

	if (Object.keys(column).length !== 0) 
	{
		columns.push(column);
	}

	// for each abbreviation in every column lay down a row
	let html = '<table border="1"><tr>';
	for (const abbreviation in rows)
	{
		// the first column in the row is always the row name
		html += `<td>${rows[abbreviation]}</td>`;
		columns.forEach(column => {
			if (column[abbreviation])
			{
				html += `<td>${column[abbreviation]}</td>`;
			}
			else
			{
				html += `<td></td>`;
			}
		});
		html += `</tr>`; // end the row
	}
	html += '</table>';
	return html;
}


// okay - the content below is about transforming this from string to loading files - this is all to-do

/**
 * Generate the Preview HTML.
 * @param {String} editorContent
 */
async function getHtml(context: vscode.ExtensionContext, fileName: string)
{
	// const editorContent = getCurrentEditorContent();

	const filePath = path.join(context.extensionPath, 'res', 'view.html');
	//const filePath = panel.webview.asWebviewUri(onDiskPath);
	let html = await loadFileContent(filePath);
	return html;
}

// load the file content
async function loadFileContent(filePath: string): Promise<string>
{
	const onDiskPath = vscode.Uri.file(filePath);

	const fileContent = await vscode.workspace.fs.readFile(onDiskPath);

	let readableContent = fileContent.toString();
	return readableContent;
}

function getWebviewContent(uri: string, content: string, table: string): string
{
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
	${table}
	<div id="paper">Existing content</div>
	<script src="${uri}"></script>
	<script>
		ABCJS.renderAbc("paper", "${content}", { minSpacing: 5, maxSpacing: 5} );
	</script>
</body>
</html>`;
}

module.exports = {
	activate
};