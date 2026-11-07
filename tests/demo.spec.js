import {test,expect} from '@playwright/test';
test('demo: túnel, scroll completo, filtros e case acessível',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const failed=[];page.on('response',r=>{if(r.url().includes('127.0.0.1')&&r.status()>=400)failed.push(r.url())});
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);await expect(page.locator('h1')).toContainText('Marcas que ainda');await expect(page.locator('canvas')).toHaveCount(1);await page.waitForTimeout(1500);
 await page.screenshot({path:`test-results/${testInfo.project.name}-hero.png`});
 const scrollTo=async y=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(1000)};
 await scrollTo(2100);await page.screenshot({path:`test-results/${testInfo.project.name}-tunel.png`});
 let active=false;for(let y=2400;y<5000;y+=350){await scrollTo(y);if(await page.locator('.case.is-active').count()){active=true;await page.screenshot({path:`test-results/${testInfo.project.name}-case.png`});break}}expect(active).toBeTruthy();
 for(const section of ['#estudio','#metodo','#indice']){await page.locator(section).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`test-results/${testInfo.project.name}-${section.slice(1)}.png`})}
 await expect(page.locator('.projeto:visible')).toHaveCount(15);await page.getByRole('button',{name:'Digital',exact:true}).click();await expect(page.locator('.projeto:visible')).toHaveCount(2);await expect(page.locator('.indice__contagem')).toHaveText('2 de 41 projetos');await page.locator('.projeto:visible').first().click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('#detalhe-titulo')).toHaveText('Preamar');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await page.getByRole('button',{name:'Todos',exact:true}).click();await expect(page.locator('.projeto:visible')).toHaveCount(15);
 await page.locator('#contato').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`test-results/${testInfo.project.name}-rodape.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);expect(failed).toEqual([]);
});
