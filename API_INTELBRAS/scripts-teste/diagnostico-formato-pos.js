/**
 * 🔍 DIAGNÓSTICO - FORMATOS DE CUPOM POS
 *
 * Este script APENAS MOSTRA os diferentes formatos
 * NÃO ENVIA NADA ao DVR!
 *
 * Você escolhe qual testar depois.
 */

console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     DIAGNÓSTICO - FORMATOS POSSÍVEIS PARA CUPOM POS             ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝');
console.log('\n');

const cupomBase = [
  'TESTE',
  'Canal 6',
  'OK'
];

console.log('📋 Testando diferentes formatos de delimitador:\n');
console.log('═'.repeat(70));

// Formato 1: Pipe |
console.log('\n1️⃣  FORMATO 1: Delimitador | (pipe - hex 7C)\n');
const formato1 = cupomBase.join('|');
console.log('   String:', JSON.stringify(formato1));
console.log('   Bytes:', Buffer.from(formato1, 'ascii').length);
console.log('   Hex:', Buffer.from(formato1, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato1.replace(/\|/g, '\n   '));

// Formato 2: Hífen -
console.log('\n2️⃣  FORMATO 2: Delimitador - (hífen - conforme página 2 Zanthus)\n');
const formato2 = cupomBase.join('-');
console.log('   String:', JSON.stringify(formato2));
console.log('   Bytes:', Buffer.from(formato2, 'ascii').length);
console.log('   Hex:', Buffer.from(formato2, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato2.replace(/-/g, '\n   '));

// Formato 3: CR+LF (\r\n)
console.log('\n3️⃣  FORMATO 3: Delimitador \\r\\n (CR+LF - padrão Windows)\n');
const formato3 = cupomBase.join('\r\n');
console.log('   String:', JSON.stringify(formato3));
console.log('   Bytes:', Buffer.from(formato3, 'ascii').length);
console.log('   Hex:', Buffer.from(formato3, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato3);

// Formato 4: LF (\n)
console.log('\n4️⃣  FORMATO 4: Delimitador \\n (LF - padrão Unix)\n');
const formato4 = cupomBase.join('\n');
console.log('   String:', JSON.stringify(formato4));
console.log('   Bytes:', Buffer.from(formato4, 'ascii').length);
console.log('   Hex:', Buffer.from(formato4, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato4);

// Formato 5: Com terminador
console.log('\n5️⃣  FORMATO 5: Pipe | + terminador \\0\n');
const formato5 = cupomBase.join('|') + '\0';
console.log('   String:', JSON.stringify(formato5));
console.log('   Bytes:', Buffer.from(formato5, 'ascii').length);
console.log('   Hex:', Buffer.from(formato5, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato5.replace(/\|/g, '\n   ').replace(/\0/g, '[FIM]'));

// Formato 6: Com terminador CR+LF
console.log('\n6️⃣  FORMATO 6: \\r\\n + terminador \\r\\n\\r\\n\n');
const formato6 = cupomBase.join('\r\n') + '\r\n\r\n';
console.log('   String:', JSON.stringify(formato6));
console.log('   Bytes:', Buffer.from(formato6, 'ascii').length);
console.log('   Hex:', Buffer.from(formato6, 'ascii').toString('hex'));
console.log('   Visual:');
console.log('   ' + formato6 + '[FIM]');

console.log('\n═'.repeat(70));
console.log('\n📊 ANÁLISE:\n');

console.log('🔸 Formato 1 (|):');
console.log('   - Documentação página 13: Configure limitador como 7C');
console.log('   - Status: TESTADO - Causa travamento ❌\n');

console.log('🔸 Formato 2 (-):');
console.log('   - Documentação página 2: "por exemplo, o caractere \'-\'"');
console.log('   - Status: NÃO TESTADO - Pode ser o correto? 🤔\n');

console.log('🔸 Formato 3 (\\r\\n):');
console.log('   - Padrão Windows/TCP');
console.log('   - Status: NÃO TESTADO\n');

console.log('🔸 Formato 4 (\\n):');
console.log('   - Padrão Unix/Linux');
console.log('   - Status: NÃO TESTADO\n');

console.log('🔸 Formato 5 (| + \\0):');
console.log('   - Com terminador null');
console.log('   - Status: NÃO TESTADO\n');

console.log('🔸 Formato 6 (\\r\\n + \\r\\n\\r\\n):');
console.log('   - Com terminador duplo CR+LF');
console.log('   - Status: NÃO TESTADO\n');

console.log('═'.repeat(70));
console.log('\n⚠️  IMPORTANTE:\n');
console.log('   NÃO vou enviar nada automaticamente!');
console.log('   Você precisa escolher qual formato testar.\n');

console.log('💡 SUGESTÕES:\n');
console.log('   1. Verificar no DVR qual delimitador está configurado');
console.log('   2. Tentar Formato 2 (-) pois está na documentação página 2');
console.log('   3. Tentar Formato 3 (\\r\\n) que é padrão TCP');
console.log('   4. Fazer teste MUITO curto: só "TESTE" (5 bytes)\n');

console.log('═'.repeat(70));
console.log('\n');
