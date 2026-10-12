import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

type Analise = {
  aprovado: boolean;
  percentual: number;
  valor: number;
  motivo: string;
};

export default function TelaConsultaCredito() {
  const [nome, setNome] = useState('');
  const [renda, setRenda] = useState('');
  const [idade, setIdade] = useState('');
  const [clt, setClt] = useState<boolean | null>(null);
  const [divida, setDivida] = useState<boolean | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);

  function consultar() {
    const rendaNumerica = Number(renda.trim().replace(/\./g, '').replace(',', '.'));
    const idadeNumerica = Number(idade);

    if (!nome.trim() || !renda.trim() || !idade.trim() || clt === null || divida === null) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os dados antes de consultar.');
      return;
    }
    if (!Number.isFinite(rendaNumerica) || rendaNumerica <= 0 ||
        !Number.isInteger(idadeNumerica) || idadeNumerica < 0) {
      Alert.alert('Dados inválidos', 'Informe uma renda positiva e uma idade válida.');
      return;
    }

    if (divida) {
      setAnalise({
        aprovado: false, percentual: 0, valor: 0,
        motivo: 'O correntista possui dívida e não tem direito ao crédito.'
      });
      return;
    }

    let percentual: number;
    if (idadeNumerica <= 24) percentual = 25;
    else if (idadeNumerica <= 49) percentual = 40;
    else if (idadeNumerica <= 64) percentual = 30;
    else percentual = 15;

    if (!clt) percentual /= 2;

    setAnalise({
      aprovado: true,
      percentual,
      valor: rendaNumerica * percentual / 100,
      motivo: 'O correntista atende às regras informadas para esta simulação.'
    });
  }

  function dinheiro(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function Opcao({ titulo, valor, selecionado, aoSelecionar }: {
    titulo: string; valor: boolean; selecionado: boolean | null; aoSelecionar: (v: boolean) => void;
  }) {
    return (
      <TouchableOpacity
        accessibilityRole="radio"
        accessibilityState={{ selected: selecionado === valor }}
        onPress={() => { aoSelecionar(valor); setAnalise(null); }}
        style={[styles.opcao, selecionado === valor && styles.opcaoAtiva]}
      >
        <View style={[styles.circulo, selecionado === valor && styles.circuloAtivo]} />
        <Text style={[styles.textoOpcao, selecionado === valor && styles.textoAtivo]}>{titulo}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.rolagem} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <Text style={styles.marca}>CAIXA</Text>
          <Text style={styles.titulo}>Consulta de Crédito</Text>
          <Text style={styles.subtitulo}>Simulação de elegibilidade e limite máximo</Text>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.tituloSecao}>Dados do correntista</Text>

          <Text style={styles.rotulo}>Nome do correntista</Text>
          <TextInput
            value={nome}
            onChangeText={(v) => { setNome(v); setAnalise(null); }}
            placeholder="Digite o nome completo"
            placeholderTextColor="#7B8798"
            style={styles.campo}
          />

          <Text style={styles.rotulo}>Renda anual (R$)</Text>
          <TextInput
            value={renda}
            onChangeText={(v) => { setRenda(v); setAnalise(null); }}
            placeholder="Ex.: 20000 ou 20000,00"
            placeholderTextColor="#7B8798"
            keyboardType="decimal-pad"
            style={styles.campo}
          />

          <Text style={styles.rotulo}>Idade</Text>
          <TextInput
            value={idade}
            onChangeText={(v) => { setIdade(v); setAnalise(null); }}
            placeholder="Informe a idade"
            placeholderTextColor="#7B8798"
            keyboardType="number-pad"
            style={styles.campo}
          />

          <Text style={styles.rotulo}>Possui vínculo CLT?</Text>
          <View style={styles.linhaOpcoes}>
            <Opcao titulo="Sim" valor={true} selecionado={clt} aoSelecionar={setClt} />
            <Opcao titulo="Não" valor={false} selecionado={clt} aoSelecionar={setClt} />
          </View>

          <Text style={styles.rotulo}>Possui dívida?</Text>
          <View style={styles.linhaOpcoes}>
            <Opcao titulo="Sim" valor={true} selecionado={divida} aoSelecionar={setDivida} />
            <Opcao titulo="Não" valor={false} selecionado={divida} aoSelecionar={setDivida} />
          </View>

          <TouchableOpacity style={styles.botao} onPress={consultar} accessibilityRole="button">
            <Text style={styles.textoBotao}>Consultar crédito</Text>
          </TouchableOpacity>
        </View>

        {analise && (
          <View style={[styles.resultado, analise.aprovado ? styles.aprovado : styles.negado]}>
            <Text style={styles.resultadoTitulo}>
              {analise.aprovado ? 'CRÉDITO APROVADO' : 'CRÉDITO NEGADO'}
            </Text>
            <Text style={styles.motivo}>{analise.motivo}</Text>
            {analise.aprovado ? (
              <>
                <Text style={styles.rotuloResultado}>Valor máximo estimado</Text>
                <Text style={styles.valor}>{dinheiro(analise.valor)}</Text>
                <Text style={styles.detalhe}>Percentual aplicado: {analise.percentual}%</Text>
                <Text style={styles.detalhe}>
                  Cálculo: {dinheiro(analise.valor / (analise.percentual / 100))} × {analise.percentual}% = {dinheiro(analise.valor)}
                </Text>
              </>
            ) : (
              <Text style={styles.detalhe}>O valor máximo disponível é R$ 0,00.</Text>
            )}
          </View>
        )}

        <Text style={styles.rodape}>Protótipo acadêmico. Não representa uma análise oficial da Caixa.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F1F5FA' },
  rolagem: { padding: 18, paddingBottom: 32 },
  topo: { backgroundColor: '#0755A4', borderRadius: 14, padding: 22, marginBottom: 18 },
  marca: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  titulo: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 12 },
  subtitulo: { color: '#E5F0FF', fontSize: 14, marginTop: 6 },
  cartao: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#D8E3F0' },
  tituloSecao: { color: '#123E75', fontSize: 20, fontWeight: '700', marginBottom: 18 },
  rotulo: { color: '#233B5B', fontSize: 15, fontWeight: '600', marginBottom: 7, marginTop: 10 },
  campo: { borderWidth: 1, borderColor: '#C7D5E6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: '#142D4E', fontSize: 16, backgroundColor: '#FFFFFF' },
  linhaOpcoes: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  opcao: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD7E6', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11, minWidth: 100 },
  opcaoAtiva: { borderColor: '#0755A4', backgroundColor: '#EAF3FF' },
  circulo: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: '#8292A7', marginRight: 9 },
  circuloAtivo: { borderColor: '#0755A4', backgroundColor: '#0755A4' },
  textoOpcao: { color: '#263C59', fontSize: 15 },
  textoAtivo: { color: '#0755A4', fontWeight: '700' },
  botao: { backgroundColor: '#0755A4', borderRadius: 9, alignItems: 'center', paddingVertical: 15, marginTop: 24 },
  textoBotao: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  resultado: { marginTop: 18, padding: 20, borderRadius: 12, borderWidth: 1 },
  aprovado: { backgroundColor: '#EAF8EF', borderColor: '#8BCDA2' },
  negado: { backgroundColor: '#FFF0F0', borderColor: '#E6A0A0' },
  resultadoTitulo: { fontSize: 21, fontWeight: '800', color: '#173B5F' },
  motivo: { fontSize: 15, color: '#2B4056', marginTop: 8, lineHeight: 22 },
  rotuloResultado: { fontSize: 15, color: '#176B38', marginTop: 16 },
  valor: { fontSize: 29, fontWeight: '800', color: '#176B38', marginVertical: 5 },
  detalhe: { fontSize: 14, color: '#344B62', marginTop: 8, lineHeight: 21 },
  rodape: { textAlign: 'center', color: '#66778B', fontSize: 12, marginTop: 18, lineHeight: 18 },
});
