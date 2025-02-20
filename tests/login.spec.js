import { test, expect } from '@playwright/test';

import { obterCodigo2FA } from '../support/db';

import { loginPage } from '../pages/loginPage';
import { DashPage } from '../pages/dashPage';

import { cleanJobs, getJob } from '../support/redis';

test('Não deve logar quando o teste de autentificação é inválido', async ({ page }) => {

  const loginPage = new loginPage(page)

  const usuario = {
    cpf: '00000014141',
    senha: '147258'
  }

  await loginPage.accesaPagina()
  await loginPage.informaCpf(usuario.cpf)
  await loginPage.informaSenha(usuario.senha)
  await loginPage.informa2FA('123456')

  await expect(page.locator('span')).toContainText('Código inválido. Por favor, tente')
});

test('Deve acessar a conta do usuario', async ({ page }) => {
  const loginPage = new loginPage(page)
  const dashPage = new DashPage(page)

  const usuario = {
    cpf: '00000014141',
    senha: '147258'
  }

  await cleanJobs()

  await loginPage.acessaPagina()
  await loginPage.informaCpf(usuario.cpf)
  await loginPage.informaSenha(usuario.senha)

  // Checkpoint
  await page.getByRole('heading', { name: 'Verificação em duas etapas' })
    .waitFor({ timeout: 3000 })

  const { codigo } = await getJob()

  //const codigo = await obterCodigo2FA(usuario.cpf)

  await loginPage.informa2FA(codigo)

  await expect(await dashPage.obterSaldo()).toHaveText('R$ 5.000,00')
});