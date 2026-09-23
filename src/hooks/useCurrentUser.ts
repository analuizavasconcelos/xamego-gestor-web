// Hook temporário para o nome do usuário exibido na saudação do Dashboard.
//
// Como a autenticação (Sanctum) ainda não foi implementada, não existe
// "usuário logado" de verdade — então por enquanto ele lê o nome de uma
// variável local (localStorage), com um valor padrão.
//
// Quando a autenticação for adicionada, troque a lógica abaixo por uma
// chamada real (ex: GET /api/user) e remova o uso do localStorage.

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'xamego_user_name'
const DEFAULT_NAME = 'Ana'

export function useCurrentUser() {
  const [name, setName] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_NAME
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, name)
  }, [name])

  return { name, setName }
}