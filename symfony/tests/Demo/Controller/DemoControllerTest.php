<?php

declare(strict_types=1);

namespace App\Tests\Demo\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class DemoControllerTest extends WebTestCase
{
    public function testIndexOnDemoHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'demo.localhost']);

        self::assertResponseIsSuccessful();
        self::assertSelectorTextContains('.page-header h1', 'Demo');
        self::assertSelectorTextContains('main', 'demo.localhost');
    }

    public function testModulesAreIsolatedByHost(): void
    {
        $client = static::createClient();

        $client->request('GET', '/', server: ['HTTP_HOST' => 'demo.localhost']);
        self::assertSelectorNotExists('[data-controller="symfony--ux-vue--vue"]');

        $client->request('GET', '/', server: ['HTTP_HOST' => 'contrast-grid.localhost']);
        self::assertSelectorExists('[data-controller="symfony--ux-vue--vue"]');
    }

    public function testNavigationLinksToOtherModuleHosts(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'demo.localhost']);

        self::assertSelectorExists('.main-nav a[href$="contrast-grid.localhost/"]');
    }
}
