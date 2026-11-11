<?php

declare(strict_types=1);

namespace App\Tests\ContrastGrid\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ContrastGridControllerTest extends WebTestCase
{
    public function testIndexRendersVueComponent(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'contrast-grid.localhost']);

        self::assertResponseIsSuccessful();
        self::assertSelectorExists(
            '[data-controller="symfony--ux-vue--vue"]'
            . '[data-symfony--ux-vue--vue-component-value="ContrastGrid/ContrastGrid"]',
        );
    }

    public function testIndexIsNotServedOnAnotherHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'other.localhost']);

        self::assertResponseStatusCodeSame(404);
    }
}
