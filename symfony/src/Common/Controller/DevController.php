<?php

declare(strict_types=1);

namespace App\Common\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\Attribute\When;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Page d'accueil de dev (et test) uniquement, jamais en prod : liste les modules et leur URL.
 */
#[When('dev')]
#[When('test')]
final class DevController extends AbstractController
{
    /**
     * @param array<string, string> $moduleHosts host par module (config/modules.yaml)
     */
    public function __construct(
        #[Autowire(param: 'modules.hosts')]
        private readonly array $moduleHosts,
    ) {
    }

    #[Route('/', name: 'dev_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $port = $request->getPort();
        $suffix = \in_array($port, [80, 443, null], true) ? '' : ':' . (string) $port;

        $modules = [];
        foreach ($this->moduleHosts as $name => $host) {
            $modules[] = [
                'name' => $name,
                'host' => $host,
                'url' => $request->getScheme() . '://' . $host . $suffix . '/',
            ];
        }

        return $this->render('@Common/dev/index.html.twig', ['modules' => $modules]);
    }
}
