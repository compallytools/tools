<?php

declare(strict_types=1);

namespace App\Tests\Common\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class DevControllerTest extends WebTestCase
{
    public function testListsModulesInDev(): void
    {
        $client = static::createClient();
        $client->request('GET', '/', server: ['HTTP_HOST' => 'localhost']);

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('a[href*="contrast-grid.localhost"]');
        self::assertSelectorExists('a[href*="demo.localhost"]');
    }
}
