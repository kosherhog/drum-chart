import { readFileSync } from 'fs';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, rep, seq, str, tok } from 'typescript-parsec';

enum TokenKind {
    Label,
    Shortcut,
    Value,
    Blank
}

const tokenizer = buildLexer([
    [true, /^\S[^:]*/g, TokenKind.Label],
    [true, /^(\S[^\r\n]*)\r?\n/g, TokenKind.Value],
    [true, /^\S/g, TokenKind.Shortcut],
    [true, /^\r?\n/g, TokenKind.Blank],
]);

function printme(value: any) {
    console.log(`Value ${value}`);
}

const header = apply(str('%drum chart'),printme);
const definition = seq(tok(TokenKind.Label),str(':'),tok(TokenKind.Shortcut));
const def_block = rep(definition);

const entry = seq(tok(TokenKind.Shortcut),str(':'),tok(TokenKind.Value));
const entry_block = rep(entry);

const chart = seq(header,tok(TokenKind.Blank),def_block);


const input = readFileSync('samples/verysmall.drum');
const output = expectSingleResult(expectEOF(chart.parse(tokenizer.parse(input.toString()))));
