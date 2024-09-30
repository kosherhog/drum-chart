import { readFileSync } from 'fs';
import { alt_sc, Token, TokenError } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, opt_sc, rep_sc, rep, seq, str, tok } from 'typescript-parsec';

enum TokenKind
{
    Directive,
    Tag,
    String,
    QString,
    Column,
    Break,
    Space,
}

const tokenizer = buildLexer([
    [true, /^#[A-Za-z_]\w*/g, TokenKind.Tag], // #tag
    [true, /^[^`\-#%\s][^`\r\n]+/g, TokenKind.String], // string that doesn't start with `#%
    [true, /^`[^`]*`/g, TokenKind.QString], // quoted string in ``
    [true, /^%[A-Za-z_]+/g, TokenKind.Directive], // %directive
    [true, /^---/g, TokenKind.Break], // break ---]
    [false, /^\s+/g, TokenKind.Space], // whitespace
]);

const header = apply(str<TokenKind>('%drumchart'), printme);
const directive = apply(seq(tok(TokenKind.Directive),opt_sc(tok(TokenKind.String))),printdir);
const directive_block = seq(rep_sc(directive),tok(TokenKind.Break));

const instruction = seq(apply(tok(TokenKind.Tag),printme),apply(alt_sc(tok(TokenKind.String),tok(TokenKind.QString)),printme));
const instruction_block = seq(rep_sc(instruction),tok(TokenKind.Break));

const chart = seq(header, rep_sc(alt_sc(directive_block,instruction_block)));

function printdir(value : [Token<TokenKind>, Token<TokenKind> | undefined]) : string
{
    console.log(`Directive ${value[0].kind} ${value[0].text}`);
    if (value[1] !== undefined)
    {
        console.log(`DVal ${value[1].kind} ${value[1].text}`);
    }
    return "";
}

function printme(value: Token<TokenKind>): string
{
    console.log(`Value ${value.kind} '${value.text}'`);
    return value.text;
}

function get_columns(value: [Token<TokenKind>, Token<TokenKind>, [Token<TokenKind>,Token<TokenKind>][]]) : string
{
    console.log(value);
    return "";
}

function printeol(value: Token<TokenKind>): string
{
    const next = value.next;
    console.log(`Next: ${next?.kind} ${next?.text}`);
    console.log(`EOL ${value.next}`);
    return value.text;
}

const input = readFileSync('samples/verysmall.drum');

const output = expectSingleResult(expectEOF(chart.parse(tokenizer.parse(input.toString() + '\n'))));
