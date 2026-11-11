<?php

declare(strict_types=1);

namespace App\Tests\ContrastGrid\ApiResource;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class PingTest extends WebTestCase
{
    public function testPingAsJsonLd(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/contrast-grid/ping', server: [
            'HTTP_HOST' => 'contrast-grid.localhost',
            'HTTP_ACCEPT' => 'application/ld+json',
        ]);

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/ld+json');

        /** @var array<string, mixed> $data */
        $data = json_decode((string) $client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
        self::assertSame('ContrastGridPing', $data['@type']);
        self::assertSame('ContrastGrid', $data['module']);
        self::assertSame('ok', $data['status']);
    }

    public function testPingAsJson(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/contrast-grid/ping', server: [
            'HTTP_HOST' => 'contrast-grid.localhost',
            'HTTP_ACCEPT' => 'application/json',
        ]);

        self::assertResponseIsSuccessful();
        self::assertJsonStringEqualsJsonString(
            '{"module":"ContrastGrid","status":"ok"}',
            (string) $client->getResponse()->getContent(),
        );
    }

    public function testPingIsNotServedOnAnotherModuleHost(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/contrast-grid/ping', server: ['HTTP_HOST' => 'demo.localhost']);

        self::assertResponseStatusCodeSame(404);
    }
}
