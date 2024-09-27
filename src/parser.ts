import { readFileSync } from 'fs';
import { Token, TokenError } from 'typescript-parsec';
import { buildLexer, expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, kmid, lrec_sc, rep_sc, rep, seq, str, tok } from 'typescript-parsec';

enum TokenKind
{
    Directive,
    Identifier,
    String,
    EOL,
}

const tokenizer = buildLexer([
    [true, /^[A-Za-z_]\w*/g, TokenKind.Identifier],
    [true, /^:[^\r\n]+\r?\n/g, TokenKind.String], // String is content between : and LF
    [true, /^\r?\n/g, TokenKind.EOL],
    [true, /^%\w+/g, TokenKind.Directive],
]);

function printme(value: [Token<TokenKind>, Token<TokenKind>]): string
{
    console.log(`Value ${value[0].kind} ${value[0].text}`);
    if (value[1].kind !== TokenKind.EOL)
    {
        console.log(`String ${value[1].kind} ${value[1].text}`);
    }
    return value[0].text;
}

function printeol(value: Token<TokenKind>): string
{
    const next = value.next;
    console.log(`Next: ${next?.kind} ${next?.text}`);
    console.log(`EOL ${value.next}`);
    return value.text;
}
const header = apply(seq(str<TokenKind>('%drumchart'), tok(TokenKind.EOL)), printme);
const definition = apply(seq(tok(TokenKind.Identifier), tok(TokenKind.String)), printme);
const def_block = seq(rep_sc(definition), rep_sc(apply(tok(TokenKind.EOL), printeol)));

const chart = seq(header, rep_sc(tok(TokenKind.EOL)), rep_sc(def_block));

const input = readFileSync('samples/verysmall.drum');

const output = expectSingleResult(expectEOF(chart.parse(tokenizer.parse(input.toString() + '\n'))));
