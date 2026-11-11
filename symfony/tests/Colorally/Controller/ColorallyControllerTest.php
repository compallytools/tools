<?php

declare(strict_types=1);

namespace App\Tests\Colorally\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ColorallyControllerTest extends WebTestCase
{
    public function testIndexOnModuleHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'colorally.localhost']);

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('header.site-header');
        self::assertSelectorTextContains('header.site-header .colorally-brand__logo', 'colorally');
        self::assertSelectorExists('header.site-header a.colorally-brand__logo[href="/"]');
        self::assertSelectorNotExists('.main-nav');
        self::assertSelectorExists('main [data-controller~="symfony--ux-vue--vue"]');
        self::assertSelectorExists('[data-symfony--ux-vue--vue-component-value="Colorally/App"]');
    }

    public function testIndexIsNotServedOnAnotherHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'other.localhost']);

        self::assertResponseStatusCodeSame(404);
    }
}
