import { readFileSync } from 'fs';
import { Token } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, rep_sc, rep, seq, str, tok } from 'typescript-parsec';

enum TokenKind {
    Directive,
    Identifier,
    String,
    EOL,
}

const tokenizer = buildLexer([
    [true, /^\w[\w0-9]*/g, TokenKind.Identifier],
    [true, /^:[^\r\n]+/g, TokenKind.String], // String are content between : and LF
    [true, /^\r?\n/g, TokenKind.EOL],
    [true, /^%\w+/g, TokenKind.Directive],
    // [true, /^\S[^\r\n]*/g, TokenKind.Value],
]);

function printme(value: [ Token<TokenKind>, Token<TokenKind> ]) : string {
    console.log(`\nValue ${value[0].text}`);
    if (value[1].kind !== TokenKind.EOL) {
        console.log(`\nString ${value[1].text}`);
    }
    return value[0].text;
}

const header = apply(seq(str<TokenKind>('%drumchart'),tok(TokenKind.EOL)),printme);
const definition = seq(apply(seq(tok(TokenKind.Identifier),tok(TokenKind.String)),printme), tok(TokenKind.EOL));
const def_block = seq(rep(definition),rep_sc(tok(TokenKind.EOL)));

const chart = seq(header,tok(TokenKind.EOL),def_block);


const input = readFileSync('samples/verysmall.drum');
const output = expectSingleResult(expectEOF(chart.parse(tokenizer.parse(input.toString() + '\n'))));
